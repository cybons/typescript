export function escapeSpecialChars(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function htmlToElement(html: string): Element {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content.firstElementChild as Element;
}

/**
 * HTML文字列からDOM Nodeを作成して返すタグ関数
 * @return {Element}
 */
export function element(strings: TemplateStringsArray, ...values: string[]): Element {
  const htmlString = strings.reduce((result, str, i) => {
    const value = values[i - 1];
    if (typeof value === 'string') {
      return result + escapeSpecialChars(value) + str;
    } else {
      return result + String(value) + str;
    }
  });
  return htmlToElement(htmlString);
}

/**
 * コンテナ要素の中身をbodyElementで上書きする
 * @param {Element} bodyElement コンテナ要素の中身となる要素
 * @param {Element} containerElement コンテナ要素
 */
export function render(bodyElement: Element, containerElement: Element): void {
  // containerElementの中身を空にする
  containerElement.innerHTML = '';
  // containerElementの直下にbodyElementを追加する
  containerElement.appendChild(bodyElement);
}
export function highlightDifferences(str1: string, str2: string): string {
  const minLength = Math.min(str1.length, str2.length);
  let result = '';

  for (let i = 0; i < minLength; i++) {
    if (str1[i] !== str2[i]) {
      result += `<span class="diff">${str2[i]}</span>`;
    } else {
      result += str2[i];
    }
  }

  if (str1.length > str2.length) {
    result += `<span class="diff">${str1.slice(minLength)}</span>`;
  } else if (str2.length > str1.length) {
    result += `<span class="diff">${str2.slice(minLength)}</span>`;
  }

  return result;
}
export function createDifferencesBlock(prev: string, current: string): HTMLElement {
  const dl = document.createElement('dl');
  dl.innerHTML = `<dt>prev</dt><dd>${prev}</dd><dt>current</dt><dd>${current}</dd>`;
  return dl;
}

export function formatDate(date: Date, format: string) {
  format = format.replace(/yyyy/g, date.getFullYear().toString());
  format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
  format = format.replace(/dd/g, ('0' + date.getDate()).slice(-2));
  format = format.replace(/HH/g, ('0' + date.getHours()).slice(-2));
  format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
  format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
  format = format.replace(/SSS/g, ('00' + date.getMilliseconds()).slice(-3));
  return format;
}
type ElementReadyOptions = {
  target?: HTMLElement | Document;
  timeout?: number;
};

export function elementReady(selector: string, options: ElementReadyOptions = {}): Promise<HTMLElement | null> {
  const target = options.target || document;
  const timeout = options.timeout || 15000;

  return new Promise((resolve, reject) => {
    let el = target.querySelector<HTMLElement>(selector);
    if (el) {
      resolve(el);
      return;
    }

    const observer = new MutationObserver((_mutationRecords, observer) => {
      // Query for elements matching the specified selector
      Array.from(target.querySelectorAll<HTMLElement>(selector)).forEach(element => {
        resolve(element);
        // Once we have resolved we don't need the observer anymore.
        observer.disconnect();
      });
    });

    observer.observe(target, {
      childList: true,
      subtree: true,
    });

    // Set a timeout to reject the promise
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`elementReady timed out after ${timeout} ms`));
    }, timeout);
  });
}

export function japaneseStandardDate(dateInput?: string | Date): Date {
  // If dateInput is provided, use it to create a Date object. Otherwise, use the current time.
  const currentDate = dateInput ? new Date(dateInput) : new Date();

  // Calculate the offset for Japanese Standard Time (UTC+9)
  const offsetInMilliseconds = (currentDate.getTimezoneOffset() + 9 * 60) * 60 * 1000;

  // Add the offset to the original date
  return new Date(currentDate.getTime() + offsetInMilliseconds);
}

export function dateDiff(beforeDate: Date, afterDate: Date): number {
  const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000; // 1日をミリ秒単位で表す定数

  // 日付を文字列として比較するため、両方の日付の時刻を 0:00 に設定
  const todayWithoutTime = new Date(beforeDate.getFullYear(), beforeDate.getMonth(), beforeDate.getDate());
  const otherDateWithoutTime = new Date(afterDate.getFullYear(), afterDate.getMonth(), afterDate.getDate());
  // 2つの日付の差分をミリ秒単位で取得し、日数に変換して返す
  const diffInDays = Math.floor(
    (otherDateWithoutTime.getTime() - todayWithoutTime.getTime()) / ONE_DAY_IN_MILLISECONDS
  );
  return diffInDays;
}
