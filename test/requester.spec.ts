import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import * as dotenv from "dotenv"

dotenv.config()

jest.mock("../src/common/config", () => ({
    serverConfigs: {
        serverPort: process.env.SERVER_PORT,
        mailServerUrl: process.env.NOTIFY_SERVER_URL,
    },
    allowIps: ["localhost", "127.0.0.1"]
}))

describe("요청자 모듈 테스트", () => {
    let app: INestApplication

    beforeAll(async () => {
        /// 모듈 initialize
        const module: TestingModule = await Test.createTestingModule({
            imports: [],
            providers: [],
        }).compile()

        app = module.createNestApplication()
        await app.init()
    })

    describe("관심 표시하기", () => {
        test.todo("등록 순서에 따라 알맞은 순서가 부여되는가")
        test.todo("요청 결과로 요청자 정보가 반환되는가, 반환된 history의 소설 snapshot이 모두 최신 데이터 인가")
    })

    describe("요청자 조회", () => {
        test.todo("ID를 기반으로 요청자의 history가 조회되는가")
    })

})