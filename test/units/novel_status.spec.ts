jest.mock("../../src/common/config", () => ({
    serverConfigs: {
        serverPort: process.env.SERVER_PORT,
        mailServerUrl: process.env.NOTIFY_SERVER_URL,
    },
    allowIps: ["localhost", "127.0.0.1"]
}))

jest.mock("../../src/provider/novel_status.provider.ts", () => {
    const origin = jest.requireActual("../../src/provider/novel_status.provider.ts")
    return {
        NovelStatusProvider: {
            handleException: origin.NovelStatusProvider.handleException,
            Entity: {
                ...origin.NovelStatusProvider.Entity,
                findUnique: jest.fn(),
                update: jest.fn()
            }
        }
    }
})

import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"

import { NovelStatusModule } from "../../src/module/novel_status.module"
import { MailService } from "../../src/service/mail.service"
import { NovelStatusService } from "../../src/service/novel_status.service"
import { NovelStatusRepository } from "../../src/repository/novel_status.repository"
import { ERROR } from "../../src/common"
import { INovelStatusEntity, NovelStatusProvider } from "../../src/provider"

import * as dotenv from "dotenv"

dotenv.config()

const testData = {
    "statusId": "cm6kp90yt0004ut5ox5lvvyfl",
    "reason": "미확인",
    "status": "pending",
    "responsiblePersonEmail": "tester@gmail.com",
    "responsiblePerson": "테스터",
    "requesterEmail": "tester@gmail.com"
}

const mockStatusSnapshotDB = [
    {
        id: "cm6khdck90004tskc83l8sp80",
        reason: "미확인",
        status: "pending",
        responsiblePersonEmail: "eatbook6@gmail.com",
        responsiblePerson: "eatbook",
        createdAt: new Date(2025, 1, 20),
    },
    {
        id: "cm6eupwgp000atsx4yd0kdc8b",
        reason: "미확인",
        status: "pending",
        responsiblePersonEmail: "eatbook6@gmail.com",
        responsiblePerson: "eatbook",
        createdAt: new Date(2025, 1, 29),
    },
    {
        id: "cm6eulld4000ctsv8hahxft58",
        reason: "미확인",
        status: "pending",
        responsiblePersonEmail: "eatbook6@gmail.com",
        responsiblePerson: "eatbook",
        createdAt: new Date(2025, 1, 25),
    }
]

describe("소설 상태 변경 모듈 테스트", () => {
    let app: INestApplication
    let novelStatusService: NovelStatusService
    let novelStatusRepository: NovelStatusRepository

    beforeAll(async () => {
        /// 모듈 initialize
        const module: TestingModule = await Test.createTestingModule({
            imports: [NovelStatusModule],
            providers: [
                NovelStatusService,
                {
                    provide: NovelStatusRepository,
                    useValue: {
                        addNovelStatusSnapshot: jest.fn(),
                    }
                },
                {
                    provide: MailService,
                    useValue: {
                        sendReminderMail: jest.fn(),
                    }
                }
            ],
        }).compile()

        app = module.createNestApplication()
        novelStatusService = app.get<NovelStatusService>(NovelStatusService)
        novelStatusRepository = app.get<NovelStatusRepository>(NovelStatusRepository)
        await app.init()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    test("테스트를 위한 준비 테스트", () => {
        expect(novelStatusService).toBeDefined()
        expect(novelStatusRepository).toBeDefined()
    })
    
    test("NovelStatusService의 assert가 호출 되고 내부 동작이 정상 작동하는가", async () => {
        const date = new Date(2025, 1, 31)

        jest.spyOn(novelStatusService, "updateReviewStatus")
        jest
        .spyOn(novelStatusRepository, "addNovelStatusSnapshot")
        .mockResolvedValue({
            id: "cm6kp90yt0004ut5ox5lvvyfl",
            snapshots: [{
                id: "cm6ets2ih0001utu0whpyzwqf",
                reason: "담당자 확인",
                status: "reviewed",
                responsiblePersonEmail: testData.responsiblePersonEmail,
                responsiblePerson: testData.responsiblePerson,
                createdAt: date,
            }],
            createdAt: date,
        })

        // private 메서드 접근을 위해 `as any` 사용
        const sendReminderEmailSpy = jest
        .spyOn(novelStatusService as any, "sendReminderEmail")
        .mockImplementation(() => {})
        const assertSpy = jest
        .spyOn(novelStatusService as any, "assertNovelStatus")
        .mockImplementationOnce((status: string) => {
            switch(status) {
                case "pending":
                case "reviewed":
                case "confirm":
                case "cancel":
                    return true
                default:
                    return false
            }
        })
        
        const dto = await novelStatusService.updateReviewStatus(testData)

        /// -----
        /// Expected called functions
        /// -----
        expect(assertSpy).toHaveBeenCalled()
        expect(sendReminderEmailSpy).toHaveBeenCalled()
        expect(novelStatusService.updateReviewStatus).toHaveBeenCalled()

        /// -----
        /// Expected return values
        /// -----
        expect(assertSpy.mock.results[0].value).toBe(true)
        expect(dto).toStrictEqual({
            "id": "cm6kp90yt0004ut5ox5lvvyfl",
            "snapshotId": "cm6ets2ih0001utu0whpyzwqf",
            "reason": "담당자 확인",
            "status": "reviewed",
            "responsiblePerson": "테스터",
            "responsiblePersonEmail": "tester@gmail.com",
            "createdAt": date,
        })

        // 성공 결과 저장
        mockStatusSnapshotDB.push({
            id: "cm6ets2ih0001utu0whpyzwqf",
            reason: "담당자 확인",
            status: "reviewed",
            responsiblePersonEmail: testData.responsiblePersonEmail,
            responsiblePerson: testData.responsiblePerson,
            createdAt: date,
        })
    })
    
    test("Prisma 트랜잭션 내부에서 기존의 상태와 변경하려는 상태를 비교하고 처리하는가", async () => {
        const date = new Date(Date.now())
        const findUniqueExpectedResult: INovelStatusEntity = {
            id: "cm6kp90yt0004ut5ox5lvvyfl",
            snapshots: [{
                id: "cm6ets2ih0001utu0whpyzwqf",
                reason: "미확인",
                status: "pending",
                responsiblePersonEmail: testData.responsiblePersonEmail,
                responsiblePerson: testData.responsiblePerson,
                createdAt: date,
            }],
            createdAt: date,
        }

        // const repoSpy = jest.spyOn(novelStatusRepository, "addNovelStatusSnapshot")
        jest
        .spyOn(NovelStatusProvider.Entity, "findUnique")
        .mockResolvedValue(findUniqueExpectedResult)

        const updateExpectedResult: INovelStatusEntity = {
            id: "cm6kp90yt0004ut5ox5lvvyfl",
            snapshots: [{
                id: "cm6ets2ih0001utu0whpyzwqf",
                reason: "담당자 확인",
                status: "reviewed",
                responsiblePersonEmail: testData.responsiblePersonEmail,
                responsiblePerson: testData.responsiblePerson,
                createdAt: date,
            }],
            createdAt: date,
        }

        jest
        .spyOn(NovelStatusProvider.Entity, "update")
        .mockResolvedValue(updateExpectedResult)

        await expect(novelStatusRepository.addNovelStatusSnapshot({
            statusId: testData.statusId,
            status: "reviewed",
            reason: "담당자 확인",
            requesterEmail: testData.requesterEmail,
            responsiblePerson: testData.responsiblePerson,
            responsiblePersonEmail: testData.responsiblePersonEmail,
        }))
        .rejects
        .toMatchObject(ERROR.NotFoundData)
    })

    test.todo("반환되는 Dto의 데이터가 가장 최근에 생성된 snapshot 데이터가 맞는가")
})