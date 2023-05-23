export class FileReadPromise {
  public files: FileList;

  constructor(files: FileList) {
    this.files = files;
  }

  readAsInt8Array(file: File): Promise<{ fileName: string; data: number[]; mimeType: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.addEventListener('load', event => {
        resolve({
          fileName: file.name,
          data: [...new Int8Array(event.target!.result as ArrayBuffer)],
          mimeType: file.type,
        });
      });

      reader.addEventListener('error', error => {
        reject(error);
      });

      reader.readAsArrayBuffer(file);
    });
  }
  readAsText(file: File): Promise<{ fileName: string; data: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.addEventListener('load', event => {
        resolve({ fileName: file.name, data: event.target!.result as string });
      });

      reader.addEventListener('error', error => {
        reject(error);
      });

      reader.readAsText(file);
    });
  }

  readMultipleFiles(): Promise<Array<{ fileName: string; data: string }>> {
    const filePromises = Array.from(this.files).map(file => this.readAsText(file));
    return Promise.all(filePromises);
  }
}

// Usage example
// const inputElement = document.getElementById('input') as HTMLInputElement;

// inputElement.addEventListener('change', async event => {
//   const files = (event.target as HTMLInputElement).files!;
//   const fileReader = new FileReadPromise(files);

//   try {
//     const fileData = await fileReader.readMultipleFiles();
//     console.log(fileData);
//   } catch (error) {
//     console.error('Error reading files:', error);
//   }
// });
