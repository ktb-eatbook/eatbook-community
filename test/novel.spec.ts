import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"

import { NovelModule } from "../src/module/novel.module"

import { NovelService } from "../src/service/novel.service"
import { NovelRepository } from "../src/repository/novel.repository"
import { MailService } from "../src/service/mail.service"
import { RequesterRepository } from "../src/repository/requester.repository"
import { 
    INovelEntity, 
    NovelProvider 
} from "../src/provider"
import { 
    RequesterHistoryProvider 
} from "../src/provider/requester_history.provider"
import { 
    IRequesterHistoryEntity 
} from "../src/provider/entity/requester_history.entity"
import { INovelSnapshotEntity } from "../src/provider/entity/novel_snapshot.entity"
import { test_data } from "../private/mock_data"
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

const mockNovelIndexDB: { [id: string]: number } = {}
const mockNovelDB: INovelEntity[] = []

const mockRequesterHistoryIndexDB: { [id: string]: number } = {}
const mockRequesterHistoryDB: IRequesterHistoryEntity[] = []

describe("소설 모듈 테스트", () => {
    let app: INestApplication
    let novelService: NovelService
    let novelRepository: NovelRepository
    let mailService: MailService
    let requesterRepository: RequesterRepository

    beforeAll(async () => {
        /// 모듈 initialize
        const module: TestingModule = await Test.createTestingModule({
            imports: [NovelModule],
            providers: [
                NovelService,
                {
                    provide: MailService,
                    useValue: {
                        sendAlertEmail: jest.fn(),
                        sendReminderEmail: jest.fn(),
                        sendEmail: jest.fn(),
                    }
                },
                NovelRepository,
                RequesterRepository,
            ],
        }).compile()

        app = module.createNestApplication()
        novelService = app.get<NovelService>(NovelService)
        novelRepository = app.get<NovelRepository>(NovelRepository)
        mailService = app.get<MailService>(MailService)
        requesterRepository = app.get<RequesterRepository>(RequesterRepository)
        await app.init()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    test("종속성 모듈 로드", () => {
        expect(novelService).toBeDefined()
        expect(novelRepository).toBeDefined()
        expect(mailService).toBeDefined()
        expect(requesterRepository).toBeDefined()
    })

    let addRequesterSpy: jest.SpyInstance
    let findFirstSpy: jest.SpyInstance
    let findUniqueSpy: jest.SpyInstance
    let upsertSpy: jest.SpyInstance
    let findManySpy: jest.SpyInstance
    let createSpy: jest.SpyInstance
    let removeSpy: jest.SpyInstance
    let totalCountSpy: jest.SpyInstance
    let createdAtDate: Date

    describe("소설 등록", () => {
        jest.useFakeTimers().setSystemTime(new Date(2025, 1, 1))
        /// -----
        /// Mocking
        /// -----
        const findUniqueSpy = jest.spyOn(NovelProvider.Entity, "findUnique")
        .mockImplementation(async (args) => {
            const index = mockNovelIndexDB[args.where.id!]
            return mockNovelDB[index]
        })
        createSpy = jest.spyOn(NovelProvider.Entity, "create")
        .mockImplementation(async args => {
            createdAtDate = new Date(2025, 1, Math.round(Math.random() * 10))
            const { sequence, requester } = args.data.requesters?.create! as any
            const { id: requesterId } = requester['connectOrCreate']['create']
            const { title, description, ref } = args.data.snapshots?.create!['info']['create']['snapshot']['create']

            const novel: INovelEntity = {
                id: args.data.id,
                snapshots: [
                    {
                        id: "novelsnapshotId-test",
                        novelInfo: {
                            id: "novelinfoId-test",
                            snapshots: [
                                {
                                    id: "novelinfosnapshotId-test",
                                    title,
                                    description,
                                    ref,
                                    createdAt: createdAtDate,
                                }
                            ],
                            createdAt: createdAtDate,
                        },
                        novelStatus: {
                            id: "novelstatusId-test",
                            snapshots: [
                                {
                                    id: "novelstatussnapshotId-test",
                                    reason: "미확인",
                                    status: "pending",
                                    responsiblePersonEmail: "admin@gmail.com",
                                    responsiblePerson: "admin",
                                    createdAt: createdAtDate,
                                }
                            ],
                            createdAt: createdAtDate,
                        },
                        createdAt: createdAtDate,
                    }
                ],
                requesters: [
                    {
                        requesterId,
                        historyId: "requetserhistoryId-test",
                        sequence,
                    }
                ],
                deleteAt: null,
                createdAt: createdAtDate,
            }

            if(mockRequesterHistoryIndexDB[requesterId] !== undefined) {
                const index = mockRequesterHistoryIndexDB[requesterId]
                const history = mockRequesterHistoryDB[index]
                history.novelId = args.data.id
                history.novelSnapshots = novel.snapshots
                history.sequence = sequence
            } else {
                mockRequesterHistoryDB.push({
                    id: "requetserhistoryId-test",
                    interestCount: 1,
                    novelId: args.data.id,
                    novelSnapshots: novel.snapshots,
                    requesterId,
                    sequence,
                    createdAt: createdAtDate
                })
                mockRequesterHistoryIndexDB[requesterId] = mockRequesterHistoryDB.length - 1
            }

            mockNovelDB.push(novel)
            mockNovelIndexDB[novel.id] = mockNovelDB.length - 1
            return novel
        })

        test("소설 등록이 정상적으로 되는가", async () => {
            addRequesterSpy = jest
            .spyOn(requesterRepository, "registFavoriteNovel")
            .mockReturnThis()

            await novelRepository.registerNovel({
                id: "test-123456789",
                novelDescription: "description",
                novelTitle: "novel title",
                ref: "https://google.com",
                requesterEmail: "tester@gmail.com",
                requesterId: "requetserId-test",
                requesterName: "tester"
            })

            const novelIndex = mockNovelIndexDB["test-123456789"]
            const expectedResult = mockNovelDB[novelIndex]
            
            /// -----
            /// Expected called functions
            /// -----   
            expect(findUniqueSpy).toHaveBeenCalled()
            expect(addRequesterSpy).not.toHaveBeenCalled()
            expect(createSpy).toHaveBeenCalled()

            /// -----
            /// Expected return values
            /// -----
            expect(expectedResult).toBeDefined()
            expect(expectedResult.requesters.length).toBe(1)

            /// 조회 테스트를 위한 데이터 삽입
            await Promise.all(
                test_data.map(
                    async (data) => await novelRepository.registerNovel({
                        id: data.id,
                        novelDescription: data.novelInfo.novelDescription,
                        novelTitle: data.novelInfo.novelTitle,
                        ref: data.novelInfo.ref,
                        requesterEmail: data.requester.requesterEmail,
                        requesterId: data.requester.requesterId,
                        requesterName: data.requester.requesterName,
                    })
                )
            )
            addRequesterSpy.mockRestore()
        })

        test("요청자 history sequence가 잘 부여 되는가", async () => {
            createdAtDate = new Date(Date.now())

            /// -----
            /// Mocking
            /// -----
            addRequesterSpy = jest.spyOn(requesterRepository, "registFavoriteNovel")
            findFirstSpy = jest.spyOn(RequesterHistoryProvider.Entity, "findFirst")
            .mockImplementation(async (args) => {
                const novelIndex = mockNovelIndexDB[args.where!.novelId! as string]
                const latestRequester = mockNovelDB[novelIndex].requesters.sort((a, b) => {
                    if(a.sequence > b.sequence) return -1
                    else if(a.sequence < b.sequence) return 1
                    return 0
                })[0]
                const historyIndex = mockRequesterHistoryIndexDB[latestRequester.requesterId]
                return mockRequesterHistoryDB[historyIndex]
            })
            /// private 함수 모킹을 위한 any 타입 지정
            upsertSpy = jest.spyOn((requesterRepository as any), "upsertRequester")
            .mockImplementation(async (args: any) => {
                let requesterIndex = mockRequesterHistoryIndexDB[args.requesterId]
                const novelIndex = mockNovelIndexDB[args.novelId]
                const novelSnapshots: INovelSnapshotEntity[] = mockNovelDB[novelIndex].snapshots
                const historyId = `requetserhistoryId-test${Math.floor(Math.random() * 10)}`
                
                if(requesterIndex === undefined) {
                    mockRequesterHistoryDB.push({
                        id: historyId,
                        interestCount: 1,
                        novelId: args.novelId,
                        novelSnapshots,
                        sequence: args.sequence,
                        requesterId: args.requesterId,
                        createdAt: createdAtDate,
                    })
                    requesterIndex = mockRequesterHistoryDB.length - 1
                    mockRequesterHistoryIndexDB[args.requesterId] = requesterIndex
                }
                const requester = mockRequesterHistoryDB[requesterIndex]
                
                mockNovelDB[novelIndex].requesters.push({
                    requesterId: requester.requesterId,
                    historyId,
                    sequence: args.sequence,
                })

                return {
                    id: args.requesterId,
                    email: args.email,
                    name: args.name,
                    histories: [
                        {
                            id: requester.id,
                            novelId: args.novelId,
                            novelSnapshots,
                            requesterId: requester.requesterId,
                            interestCount: 1,
                            sequence: args.sequence,
                            createdAt: createdAtDate,
                        }
                    ],
                }
            })
            
            await requesterRepository.registFavoriteNovel({
                requesterId: "requetserId-test2",
                novelId: "test-123456789",
                email: "tester2@gmail.com",
                name: "tester2",
            })

            const historyIndex = mockRequesterHistoryIndexDB["requetserId-test2"]
            const expectedHistory = mockRequesterHistoryDB[historyIndex]

            /// -----
            /// Expected called functions
            /// -----
            expect(findFirstSpy).toHaveBeenCalled()
            expect(upsertSpy).toHaveBeenCalled()

            /// -----
            /// Expected return values
            /// -----
            expect(expectedHistory.sequence).toBe(2)
            expect(expectedHistory.novelId).toBe("test-123456789")

            addRequesterSpy.mockRestore()
        })

        test("중복 요청이 정상적으로 잘 처리 되는가", async () => {
            createdAtDate = new Date(Date.now())
            addRequesterSpy = jest.spyOn(requesterRepository, "registFavoriteNovel")

            await novelRepository.registerNovel({
                id: "test-123456789",
                novelDescription: "description",
                novelTitle: "novel title",
                ref: "https://google.com",
                requesterEmail: "tester3@gmail.com",
                requesterId: "requetserId-test3",
                requesterName: "tester3"
            })

            const novelIndex = mockNovelIndexDB["test-123456789"]
            const expectedResult = mockNovelDB[novelIndex]
            const historyIndex = mockRequesterHistoryIndexDB["requetserId-test3"]
            const expectedHistory = mockRequesterHistoryDB[historyIndex]

            /// -----
            /// Expected called functions
            /// -----
            expect(findFirstSpy).toHaveBeenCalled()
            expect(upsertSpy).toHaveBeenCalled()
            expect(findUniqueSpy).toHaveBeenCalled()
            expect(addRequesterSpy).toHaveBeenCalled()
            expect(createSpy).not.toHaveBeenCalled()

            /// -----
            /// Expected return values
            /// -----
            expect(expectedHistory.sequence).toBe(3)
            expect(expectedHistory.novelId).toBe("test-123456789")
            expect(expectedHistory.requesterId).toBe("requetserId-test3")
            expect(expectedResult).toBeDefined()
            expect(expectedResult.requesters.length).toBe(3)
        })

        test("소설 등록 결과에 따라 알림 메일 송신 혹은 boolean 값을 반환하는가", async () => {
            createdAtDate = new Date(Date.now())
            const sendAlertEmailSpy = jest.spyOn((novelService as any), "sendAlertEmail")
            const sendEmailSpy = jest
            .spyOn(Object.getPrototypeOf(mailService), "sendEmail")
            .mockImplementation(() => {})

            /// ----- 중복 요청 테스트 -----
            const result1 = await novelService.registerNovel({
                id: "test-123456789",
                novelDescription: "description",
                novelTitle: "novel title",
                ref: "https://google.com",
                requesterEmail: "tester4@gmail.com",
                requesterId: "requetserId-test4",
                requesterName: "tester4",
            })
            const novelIndex1 = mockNovelIndexDB["test-123456789"]
            const expectedResult1 = mockNovelDB[novelIndex1]
            const historyIndex1 = mockRequesterHistoryIndexDB["requetserId-test4"]
            const expectedHistory1 = mockRequesterHistoryDB[historyIndex1]
            
            /// -----
            /// Expected called functions
            /// -----
            expect(sendEmailSpy).not.toHaveBeenCalled()

            /// -----
            /// Expected return values
            /// -----
            expect(result1).toBe(undefined)
            expect(expectedResult1).toBeDefined()
            expect(expectedResult1.requesters.length).toBe(4)
            expect(expectedHistory1.novelId).toBe("test-123456789")
            expect(expectedHistory1.requesterId).toBe("requetserId-test4")
            expect(expectedHistory1.sequence).toBe(4)


            /// ----- 새로운 소설 등록 요청 테스트 -----
            const result2 = await novelService.registerNovel({
                id: "test-987654321",
                novelDescription: "description2",
                novelTitle: "novel title2",
                ref: "https://google.com",
                requesterEmail: "tester5@gmail.com",
                requesterId: "requetserId-test5",
                requesterName: "tester5",
            })
            const novelIndex2 = mockNovelIndexDB["test-987654321"]
            const expectedResult2 = mockNovelDB[novelIndex2]
            const historyIndex2 = mockRequesterHistoryIndexDB["requetserId-test5"]
            const expectedHistory2 = mockRequesterHistoryDB[historyIndex2]

            /// -----
            /// Expected called functions
            /// -----
            expect(sendAlertEmailSpy).toHaveBeenCalled()
            expect(sendEmailSpy).toHaveBeenCalled()

            /// -----
            /// Expected return values
            /// -----
            expect(result2).not.toBe(undefined)
            expect(expectedResult2).toBeDefined()
            expect(expectedResult2.id).toBe("test-987654321")
            expect(expectedResult2.requesters.length).toBe(1)
            expect(expectedHistory2.novelId).toBe("test-987654321")
            expect(expectedHistory2.requesterId).toBe("requetserId-test5")
            expect(expectedHistory2.sequence).toBe(1)

            jest.restoreAllMocks()
        })
    })

    describe("소설 조회", () => {
        test("page와 orderBy를 기준으로 잘 조회되는가", async () => {
            findManySpy = jest
            .spyOn(NovelProvider.Entity, "findMany")
            .mockImplementation(async (args) => {
               return mockNovelDB
                .filter((novel) => novel.deleteAt === null)
                .slice(args.skip, (args.skip ?? 0) + (args.take ?? 10))
                .sort((a, b) => {
                    if(args.orderBy!['createdAt'] === "desc") {
                        if(a.createdAt > b.createdAt) return -1
                        else if(a.createdAt < b.createdAt) return 1
                        else return 0
                    } else {
                        if(a.createdAt > b.createdAt) return 1
                        else if(a.createdAt < b.createdAt) return -1
                        else return 0
                    }
                })
            })
            totalCountSpy = jest
            .spyOn(NovelProvider.Entity, "totalCount")
            .mockImplementation(async () => {
                return Math.max(
                    1,
                    Math.ceil(
                        mockNovelDB.filter(
                            (novel) => novel.deleteAt === null
                        ).length / 10
                    )
                )
            })

            const result = await novelService.getNovelList(1, "desc")
            const latestNovelFromResult = result.list[0]
            const latestNovelFromSort = result.list.sort((a, b) => {
                if(a.createdAt > b.createdAt) return -1
                else if(a.createdAt < b.createdAt) return 1
                else return 0
            })[0]

            /// -----
            /// Expected return values
            /// -----
            expect(latestNovelFromResult.id).toBe(latestNovelFromSort.id)
            expect(latestNovelFromResult.createdAt).toStrictEqual(latestNovelFromSort.createdAt)
            expect(latestNovelFromResult).toStrictEqual(latestNovelFromSort)
        })
        test("ID를 기반으로 조회가 되는가", async () => {
            findUniqueSpy = jest
            .spyOn(NovelProvider.Entity, "findUnique")
            .mockImplementation(async (args) => {
                const result = mockNovelDB
                .filter((novel) => novel.deleteAt === null)
                .find((novel) => novel.id === args.where.id)

                if(!result) throw ERROR.NotFoundData
                return result
            })

            const result1 = await novelService.getNovel("G905-20250221")
            
            /// -----
            /// Expected return values
            /// -----
            expect(result1.id).toBe("G905-20250221")
            await expect(novelService.getNovel("G905-20251234"))
            .rejects
            .toStrictEqual(ERROR.NotFoundData)

            jest.restoreAllMocks()
        })
    })

    describe("소설 삭제", () => {
        test("요청 시, softdelete 처리 되는가", async () => {
            removeSpy = jest
            .spyOn(NovelProvider.Entity, "remove")
            .mockImplementation(async (args) => {
                let targetIndex: number | undefined
                return mockNovelDB
                .map(
                    (novel, index) => {
                        if(novel.id === args) {
                            novel.deleteAt = new Date(Date.now())
                            targetIndex = index
                        }
                        return novel
                    }
                )[targetIndex ?? 999]
            })
            const result = await novelService.deleteNovel("G905-20250221")
            const result2 = await novelService.deleteNovel("G905-20251234")

            /// -----
            /// Expected return values
            /// -----
            expect(result).toBe(true)
            expect(result2).toBe(false)
        })
    })
})