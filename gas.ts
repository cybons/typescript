type ArgType = string | number | Array<any> | { [key: string]: any };

export const gasRun =
  (func: string) =>
  (
    ...args: ArgType[]
  ): Promise<string | Array<any> | { [key: string]: any }> => {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler((e: any) => {
          resolve(e);
        })
        .withFailureHandler((e: any) => {
          reject(e);
        })
        [func](...args);
    });
  };
