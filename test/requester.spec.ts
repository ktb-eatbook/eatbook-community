import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"

import { INovelEntity, IRequesterEntity, RequesterProvider } from "../src/provider"
import { RequesterRepository } from "../src/repository/requester.repository"
import { RequesterService } from "../src/service/requester.service"
import { RequesterModule } from "../src/module/requester.module"
import { RequesterHistoryProvider } from "../src/provider/requester_history.provider"
import { IRequesterHistoryEntity } from "../src/provider/entity/requester_history.entity"
import { ERROR } from "../src/common"

import * as dotenv from "dotenv"

dotenv.config()

jest.mock("../src/common/config", () => ({
    serverConfigs: {
        serverPort: process.env.SERVER_PORT,
        mailServerUrl: process.env.NOTIFY_SERVER_URL,
    },
    allowIps: ["localhost", "127.0.0.1"]
}))

const mockNovelIndexDB: { [id: string]: number } = {
    'test-123456789': 0,
}
const mockNovelDB: INovelEntity[] = [
    {
      id: 'test-123456789',
      snapshots: [{
        id: "novelSnapshotId",
        novelInfo: {
            id: "novelInfoId",
            snapshots: [
                {
                    "id": "novelInfoSnapshotId",
                    "title": "음메에에에",
                    "description": "양을 보며 힐링",
                    "ref": "https://www.youtube.com/shorts/ddad_taH_PE",
                    "createdAt": new Date(2025, 2, 1),
                }
            ],
            createdAt: new Date(2025, 2, 1),
        },
        novelStatus: {
            id: "novelStatusId",
            snapshots: [
                {
                    id: "novelStatusSnapshotId",
                    reason: "미확인",
                    responsiblePerson: "테스터",
                    responsiblePersonEmail: "tester@gmail.com",
                    status: "pending",
                    createdAt: new Date(2025, 2, 1)
                }
            ],
            createdAt: new Date(2025, 2, 1)
        },
        createdAt: new Date(2025, 2, 1),
      }],
      requesters: [],
      deleteAt: null,
      createdAt: new Date(2025, 2, 1)
    },
]

const mockRequesterIndexDB: { [id: string]: number } = {}
const mockRequesterDB: IRequesterEntity[] = []
const mockRequesterHistoryIndexDB: { [id: string]: number } = {}
const mockRequesterHisotryDB: IRequesterHistoryEntity[] = []

describe("요청자 모듈 테스트", () => {
    let requesterService: RequesterService
    let requesterRepository: RequesterRepository
    let app: INestApplication

    beforeAll(async () => {
        /// 모듈 initialize
        const module: TestingModule = await Test.createTestingModule({
            imports: [RequesterModule],
            providers: [
                {
                    provide: RequesterService,
                    useValue: {
                        searchRequester: jest.fn(),
                        addFavoriteNovel: jest.fn(),
                    }
                },
                {
                    provide: RequesterRepository,
                    useValue: {
                        findRequester: jest.fn(),
                        registFavoriteNovel: jest.fn(),
                        upsertRequester: jest.fn(),
                    }
                }
            ],
        }).compile()

        app = module.createNestApplication()
        requesterService = module.get<RequesterService>(RequesterService)
        requesterRepository = module.get<RequesterRepository>(RequesterRepository)
        await app.init()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    test("종속성 모듈 로드", () => {
        expect(requesterService).toBeDefined()
        expect(requesterRepository).toBeDefined()
    })

    describe("관심 표시하기", () => {
        test("등록 순서에 따라 알맞은 순서가 부여되는가", async () => {
            const findFirstSpy = jest
            .spyOn(RequesterHistoryProvider.Entity, "findFirst")
            .mockImplementation(async (args) => {
                return mockRequesterHisotryDB
                .filter((history) => history.novelId === `${args.where?.novelId}`)
                .sort((a, b) => {
                    if(a.sequence > b.sequence) return -1
                    else if(a.sequence < b.sequence) return 1
                    else return 0
                })[0]
            })
            const upsertSpy = jest
            .spyOn(RequesterProvider.Entity, "upsert")
            .mockImplementation(async (args) => {
                let requesterIndex: number | undefined = mockRequesterIndexDB[`${args.where.id}`]
                if(requesterIndex) {
                    const requester = mockRequesterDB[requesterIndex]
                    const { id: novelId } = args.update.history?.create!["novel"]["connect"]
                    const sequence = args.update.history?.create!["sequence"]
                    const novelIndex = mockNovelIndexDB[novelId]
                    const novel = mockNovelDB[novelIndex]
                    const randnum = Math.round(Math.random() * 9)
                    const historyId = `requesterHistoryId-${randnum}`
                    const history = {
                        id: historyId,
                        interestCount: 1,
                        novelId,
                        novelSnapshots: novel.snapshots,
                        requesterId: requester.id,
                        sequence: sequence,
                        createdAt: new Date(2025, 1, Math.round(Math.random() * 10))
                    }

                    mockRequesterHistoryIndexDB[historyId] = mockRequesterHisotryDB.length
                    mockRequesterHisotryDB.push(history)
                    requester.histories.push(history)
                    return requester
                } else {
                    const requesterId = `${args.where.id}`
                    const randnum = Math.round(Math.random() * 9)
                    const { id: novelId } = args.create.history?.create!["novel"]["connect"]
                    const sequence = args.create.history?.create!["sequence"]
                    const novelIndex = mockNovelIndexDB[novelId]
                    const novel = mockNovelDB[novelIndex]
                    const historyId = `requesterHistoryId-${randnum}`
                    const history = {
                        id: historyId,
                        interestCount: 1,
                        novelId,
                        novelSnapshots: novel.snapshots,
                        requesterId: requesterId,
                        sequence: sequence,
                        createdAt: new Date(2025, 1, Math.round(Math.random() * 10))
                    }
                    const requester = {
                        id: requesterId,
                        email: args.create.email,
                        name: args.create.name,
                        histories: [history],
                    }

                    mockRequesterHistoryIndexDB[historyId] = mockRequesterHisotryDB.length
                    mockRequesterHisotryDB.push(history)
                    mockRequesterIndexDB[requesterId] = mockRequesterDB.length
                    mockRequesterDB.push(requester)
                    return requester
                }
            })
            const upsertRequesterSpy = jest.spyOn((requesterRepository as any), "upsertRequester")
            const registFavoriteNovelSpy = jest.spyOn(requesterRepository, "registFavoriteNovel")
            const addFavoriteNovelSpy = jest.spyOn(requesterService, "addFavoriteNovel")

            const result1 = (await requesterService.addFavoriteNovel({
                email: "tester@gmail.com",
                name: "테스터",
                novelId: 'test-123456789',
                requesterId: "requesterId-0",
            })).histories.find((history) => history.novelId === 'test-123456789')
            const result2 = (await requesterService.addFavoriteNovel({
                email: "tester2@gmail.com",
                name: "테스터2",
                novelId: 'test-123456789',
                requesterId: "requesterId-1",
            })).histories.find((history) => history.novelId === 'test-123456789')

            /// -----
            /// Expected called functions
            /// -----
            expect(addFavoriteNovelSpy).toHaveBeenCalled()
            expect(registFavoriteNovelSpy).toHaveBeenCalled()
            expect(findFirstSpy).toHaveBeenCalled()
            expect(upsertRequesterSpy).toHaveBeenCalled()
            expect(upsertSpy).toHaveBeenCalled()

            /// -----
            /// Expected return values
            /// -----
            expect(result1).toBeDefined()
            expect(result2).toBeDefined()
            expect(result1!.sequence).toBe(1)
            expect(result2!.sequence).toBe(2)

            jest.restoreAllMocks()
        })
    })

    describe("요청자 조회", () => {
        test("ID를 기준으로 요청한 데이터가 정확히 반환되는가", async () => {
            const findUniqueSpy = jest
            .spyOn(RequesterProvider.Entity, "findUnique")
            .mockImplementation(async (args) => {
                const requesterIndex = mockRequesterIndexDB[`${args.where.id}`]
                if(requesterIndex === undefined) throw ERROR.NotFoundData
                return mockRequesterDB[requesterIndex]
            })
            const findRequesterSpy = jest.spyOn(requesterRepository, "findRequester")
            const searchRequesterSpy = jest.spyOn(requesterService, "searchRequester")

            const serviceResult = await requesterService.searchRequester("requesterId-1")
            
            /// -----
            /// Expected called functions
            /// -----
            expect(findUniqueSpy).toHaveBeenCalled()
            expect(findRequesterSpy).toHaveBeenCalled()
            expect(searchRequesterSpy).toHaveBeenCalled()

            /// -----
            /// Expected return values
            /// -----
            expect(serviceResult).toBeDefined()
            await expect(requesterService.searchRequester("requesterId-2"))
            .rejects
            .toStrictEqual(ERROR.NotFoundData)
        })
    })

})