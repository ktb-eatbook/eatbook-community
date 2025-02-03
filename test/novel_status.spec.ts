import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"

import { NovelStatusModule } from "../src/module/novel_status.module"
import { MailService } from "../src/service/mail.service"
import { NovelStatusService } from "../src/service/novel_status.service"
import { NovelStatusRepository } from "../src/repository/novel_status.repository"
import { ERROR } from "../src/common"
import { 
    INovelStatusEntity, 
    INovelStatusSnapshotEntity, 
    NovelStatusProvider 
} from "../src/provider"

import * as dotenv from "dotenv"

dotenv.config()

jest.mock("../src/common/config", () => ({
    serverConfigs: {
        serverPort: process.env.SERVER_PORT,
        mailServerUrl: process.env.NOTIFY_SERVER_URL,
    },
    allowIps: ["localhost", "127.0.0.1"]
}))

const testData = {
    "statusId": "cm6kp90yt0004ut5ox5lvvyfl",
    "reason": "미확인",
    "status": "pending",
    "responsiblePersonEmail": "tester@gmail.com",
    "responsiblePerson": "테스터",
    "requesterEmail": "tester@gmail.com"
}

const mockStatusSnapshots: INovelStatusSnapshotEntity[] = [
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
    let mailService: MailService

    beforeAll(async () => {
        /// 모듈 initialize
        const module: TestingModule = await Test.createTestingModule({
            imports: [NovelStatusModule],
            providers: [
                NovelStatusService,
                NovelStatusRepository,
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
        mailService = app.get<MailService>(MailService)
        await app.init()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test("종속성 모듈 로드", () => {
        expect(novelStatusService).toBeDefined()
        expect(novelStatusRepository).toBeDefined()
        expect(mailService).toBeDefined()
    })
    
    test("NovelStatusService의 assert가 호출 되고 가장 최근 데이터를 반환하는가", async () => {
        const date = new Date(2025, 1, 31)
        mockStatusSnapshots.push({
            id: "cm6ets2ih0001utu0whpyzwqf",
            reason: "담당자 확인",
            status: "reviewed",
            responsiblePersonEmail: testData.responsiblePersonEmail,
            responsiblePerson: testData.responsiblePerson,
            createdAt: date,
        })

        jest.spyOn(novelStatusService, "updateReviewStatus")
        jest
        .spyOn(novelStatusRepository, "addNovelStatusSnapshot")
        .mockResolvedValue({
            id: "cm6kp90yt0004ut5ox5lvvyfl",
            snapshots: mockStatusSnapshots,
            createdAt: date,
        })

        // private 메서드 접근을 위해 `as any` 사용
        const sendEmailSpy = jest
        .spyOn(mailService as any, "sendEmail")
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
        expect(sendEmailSpy).toHaveBeenCalled()
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
            "createdAt": new Date(2025, 1, 31),
        })

        /// -----
        /// Expected reject values
        /// -----
        await expect(novelStatusService.updateReviewStatus({
            ...testData,
            status: "hi",
        }))
        .rejects
        .toStrictEqual(ERROR.BadRequest)
    })
    
    test("Prisma 트랜잭션 내부에서 기존의 상태와 변경하려는 상태를 비교하고 처리하는가", async () => {
        const date = new Date(Date.now())
        const findUniqueExpectedResult: INovelStatusEntity = {
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
        .spyOn(novelStatusRepository, "addNovelStatusSnapshot")
        const findSpy = jest
        .spyOn(NovelStatusProvider.Entity, "findUnique")
        .mockResolvedValue(findUniqueExpectedResult)
        const updateSpy = jest
        .spyOn(NovelStatusProvider.Entity, "update")
        .mockResolvedValue(updateExpectedResult)

        /// -----
        /// Expected reject values
        /// -----
        await expect(novelStatusRepository.addNovelStatusSnapshot({
            statusId: testData.statusId,
            status: "reviewed",
            reason: "담당자 확인",
            requesterEmail: testData.requesterEmail,
            responsiblePerson: testData.responsiblePerson,
            responsiblePersonEmail: testData.responsiblePersonEmail,
        }))
        .rejects
        .toMatchObject(ERROR.Conflict)

        /// -----
        /// Expected have been calls
        /// -----
        expect(findSpy).toHaveBeenCalled()
        expect(updateSpy).not.toHaveBeenCalled()
    })
})