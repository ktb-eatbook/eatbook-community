import { PrismaClient } from "@prisma/client"

(async () => {
    const client = new PrismaClient()

    try {
        console.log("Prisma Clinet 연결...")
        await client.$connect()
        console.log("성공")
    
        console.log("테스트 데이터 삽입...")
        const result = await Promise.all(
            new Array(40000).fill(0).map(
                async (_, index) => await client
                .novel
                .create({
                    data: {
                        id: `G905-${`${index}`.padStart(8, "0")}`,
                        snapshots: {
                            create: {
                                info: {
                                    create: {
                                        snapshot: {
                                            create: {
                                                title: "음메에에에",
                                                description: "양을 보며 힐링",
                                                ref: "https://www.youtube.com/shorts/ddad_taH_PE",
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