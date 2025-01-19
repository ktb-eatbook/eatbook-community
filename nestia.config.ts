import { INestiaConfig } from "@nestia/sdk";

export const NESTIA_CONFIG: INestiaConfig = {
  /**
   * Accessor of controller classes.
   *
   * You can specify it within two ways.
   *
   *   - Asynchronous function returning `INestApplication` instance
   *   - Specify the path or directory of controller class files
   */
  // input: "src/controllers",
  // input: "src/**/*.controller.ts",
  input: "src/controller/*.controller.ts",

  /**
   * Building `swagger.json` is also possible.
   *
   * If not specified, you can't build the `swagger.json`.
   */
  swagger: {
    /**
     * Output path of the `swagger.json`.
     *
     * If you've configured only directory, the file name would be the `swagger.json`.
     * Otherwise you've configured the full path with file name and extension, the
     * `swagger.json` file would be renamed to it.
     */
    output: "./swagger/swagger.json",
    operationId: (props) => `${props.class}.${props.function}`,
    info: { 
      description: "Eatbook 커뮤니티 API Docs",
      contact: {
        email : "rkdalsdl112@gmail.com",
        name: "KangMin Han",
        url: "https://github.com/rkdalsdl98"
      },
      version: "1.0.0",
    },
    security: {
      // 요청에 대한 검증 방식을 지정 (네스티아 스웨거에서 사용 됨)
      // 직접적인 처리를 해주는 부분은 아니니 검증은 따로 Guard, Passport 등으로 구현해야 함
      // bearer (이름 자유): {
      //   type: "apiKey", 타입에 따라 다른 값을 주어야 함, 아래는 apikey식
      //   in: "header", 해당 검증 코드를 넣어둘 곳
      //   name: "Authorization" 넣은곳에 키값
      // }
    },
    servers: [
      {
        url: "http://localhost:3000/docs",
        description: "Community API (HTTP)"
      },
      {
        url: "https://localhost:3000/docs",
        description: "Community API (HTTPS)"
      },
    ]
  },

  /**
   * Output directory that SDK would be placed in.
   *
   * If not configured, you can't build the SDK library.
   */
  output: "src/api",

  /**
   * Target directory that SDK distribution files would be placed in.
   *
   * If you configure this property and runs `npx nestia sdk` command,
   * distribution environments for the SDK library would be generated.
   *
   * After the SDK library generation, move to the `distribute` directory,
   * and runs `npm publish` command, then you can share SDK library with
   * other client (frontend) developers.
   */
  // distribute: "packages/api",

  /**
   * Whether to use propagation mode or not.
   *
   * If being configured, interaction functions of the SDK library would
   * perform the propagation mode. The propagation mode means that never
   * throwing exception even when status code is not 200 (or 201), but just
   * returning the {@link IPropagation} typed instance, which can specify its body
   * type through discriminated union determined by status code.
   *
   * @default false
   */
  // propagate: true,

  /**
   * Allow simulation mode.
   *
   * If you configure this property to be `true`, the SDK library would be contain
   * simulation mode. In the simulation mode, the SDK library would not communicate
   * with the real backend server, but just returns random mock-up data
   * with requestion data validation.
   *
   * For reference, random mock-up data would be generated by `typia.random<T>()`
   * function.
   *
   * @default false
   */
  // simulate: true,
};
export default NESTIA_CONFIG;
