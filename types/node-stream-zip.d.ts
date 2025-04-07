declare module 'node-stream-zip' {
  interface StreamZipOptions {
    file: string;
    storeEntries?: boolean;
  }

  class StreamZipAsync {
    constructor(options: StreamZipOptions);
    extract(entry: string | null, outPath: string): Promise<number | undefined>;
    close(): Promise<void>;
  }

  class StreamZip {
    constructor(options: StreamZipOptions);
    on(event: string, callback: (...args: any[]) => void): void;
    extract(targetPath: string, callback: (error?: Error) => void): void;
    close(): void;
    static async: typeof StreamZipAsync;
  }

  export = StreamZip;
} 