import { PrismaClient } from "@prisma/client"
import { test_data } from "../private/mock_data"

(async () => {
    const client = new PrismaClient()

    try {
        console.log("Prisma Clinet 연결...")
        await client.$connect()
        console.log("성공")
    
        console.log("테스트 데이터 삽입...")
        const result = await Promise.all(
            test_data.map(
                async (data) => await client
                .novel
                .create({
                    data: {
                        id: data.id,
                        requesters: {
                            create: {
                                sequence: 1,
                                requester: {
                                    connectOrCreate: {
                                        create: {
                                            id: data.requester.requesterId,
                                            email: data.requester.requesterEmail,
                                            name: data.requester.requesterName,
                                        },
                                        where: {
                                            id: data.requester.requesterId,
                                        }
                                    }
                                }
                            },
                        },
                        snapshots: {
                            create: {
                                info: {
                                    create: {
                                        snapshot: {
                                            create: {
                                                title: data.novelInfo.novelTitle,
                                                description: data.novelInfo.novelDescription,
                                                ref: data.novelInfo.ref,
                                            }
                                        }
                                    }
                                },
                                status: {
                                    create: {
                                        snapshot: {
                                            create: {
                                                reason: "미확인",
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
            )
        )
        console.log(`${result.length}개의 데이터 삽입 성공`)
    } catch(e) {
        console.error("오류 발생")
        console.error(`Reason: ${e}`)
    } finally {
        console.log("Prisma Clinet 연결 종료...")
        await client.$disconnect()
        console.log("성공")
    }
})()