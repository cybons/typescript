/**
 * IPアドレスを表すクラス
 */
export class IPAddress {
  ip: number;

  /**
   * コンストラクタ
   * @param ip IPアドレスの文字列
   */
  constructor(ip: string) {
    if (!IPAddress.isValidIpAddress(ip)) {
      throw new Error('Invalid IP address format');
    }
    this.ip = IPAddress.ipToNumber(ip);
  }
  /**
   * IPアドレスを文字列から数値に変換する
   * @param ip IPアドレスの文字列
   * @returns IPアドレスの数値
   */
  static ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  }

  /**
   * 文字列が有効なIPアドレスであるかを検証する
   * @param ip 検証するIPアドレスの文字列
   * @returns 有効なIPアドレスの場合はtrue、そうでない場合はfalse
   */
  static isValidIpAddress(ip: string): boolean {
    const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  }

  /**
   * IPアドレスを2進数形式（バイナリ形式）の文字列として取得する
   * @returns 2進数形式のIPアドレス
   */
  getBinary(): string {
    return this.ip.toString(2).padStart(32, '0');
  }

  /**
   * IPアドレスのクラス（A、B、C、D、E）を取得する
   * @returns IPアドレスのクラス
   */
  getClass(): string {
    if (IPAddress.ipToNumber('0.0.0.0') <= this.ip && this.ip <= IPAddress.ipToNumber('127.255.255.255')) {
      return 'A';
    }
    if (IPAddress.ipToNumber('128.0.0.0') <= this.ip && this.ip <= IPAddress.ipToNumber('191.255.255.255')) {
      return 'B';
    }
    if (IPAddress.ipToNumber('192.0.0.0') <= this.ip && this.ip <= IPAddress.ipToNumber('223.255.255.255')) {
      return 'C';
    }
    if (IPAddress.ipToNumber('224.0.0.0') <= this.ip && this.ip <= IPAddress.ipToNumber('239.255.255.255')) {
      return 'D';
    }
    if (IPAddress.ipToNumber('240.0.0.0') <= this.ip && this.ip <= IPAddress.ipToNumber('255.255.255.255')) {
      return 'E';
    }
    return 'Out of range';
  }

  /**
   * IPアドレスがプライベートアドレスであるかを判定する
   * @returns プライベートアドレスである場合はアドレスのクラス(A, B, C)とtrue、そうでない場合はnullとfalse
   */
  isPrivate(): { isPrivate: boolean; class: string | null } {
    const classARange = [IPAddress.ipToNumber('10.0.0.0'), IPAddress.ipToNumber('10.255.255.255')];
    const classBRange = [IPAddress.ipToNumber('172.16.0.0'), IPAddress.ipToNumber('172.31.255.255')];
    const classCRange = [IPAddress.ipToNumber('192.168.0.0'), IPAddress.ipToNumber('192.168.255.255')];

    if (this.ip >= classARange[0] && this.ip <= classARange[1]) {
      return { isPrivate: true, class: 'A' };
    } else if (this.ip >= classBRange[0] && this.ip <= classBRange[1]) {
      return { isPrivate: true, class: 'B' };
    } else if (this.ip >= classCRange[0] && this.ip <= classCRange[1]) {
      return { isPrivate: true, class: 'C' };
    } else {
      return { isPrivate: false, class: null };
    }
  }
  static numberToIp(num: number): string {
    // let bin = Number(num).toString(2).padStart(32, '0');
    // return [bin.slice(0, 8), bin.slice(8, 16), bin.slice(16, 24), bin.slice(24, 32)].map(e => parseInt(e, 2)).join('.');
    return [num >>> 24, (num >>> 16) & 255, (num >>> 8) & 255, num & 255].join('.');
  }

  static ipToCidr(ip: IPAddress): number {
    return ip.getBinary().split('1').length - 1;
  }
}

export class CidrRange extends IPAddress {
  mask: number;
  rangeStart: number;
  rangeEnd: number;

  constructor(cidrRange: string) {
    super(cidrRange.split('/')[0]);
    const prefixLength = parseInt(cidrRange.split('/')[1]);
    this.mask = ~(2 ** (32 - prefixLength) - 1) >>> 0;
    this.rangeStart = this.ip & this.mask;
    this.rangeEnd = this.rangeStart | ~this.mask;
  }

  isValidCidr(cidr: string): boolean {
    const cidrRegex =
      /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/([0-9]|[12][0-9]|3[0-2])$/;
    return cidrRegex.test(cidr);
  }

  isIpInRange(ipAddress: string): boolean {
    let targetIp = new IPAddress(ipAddress);
    const targetRangeStart = targetIp.ip & this.mask;
    const targetRangeEnd = targetRangeStart | ~this.mask;

    return targetRangeStart >= this.rangeStart && targetRangeEnd <= this.rangeEnd;
  }

  static cidrToMask(cidr: number): string {
    return IPAddress.numberToIp(parseInt(String('').padStart(cidr, '1').padEnd(32, '0'), 2));
  }
}

/**
 * ネットワークアドレスを表すクラス
 */
export class NetworkAddress {
  ip: number;
  subnetmask: number;

  /**
   * コンストラクタ
   * @param ip IPアドレスの文字列、またはCIDR形式のネットワークアドレスの文字列
   * @param subnetmask サブネットマスクの文字列（CIDR形式のネットワークアドレスを使用する場合は不要）
   */
  constructor(input: string);
  constructor(ip: string, subnetmask: string);
  constructor(ipOrCidr: string, subnetmask?: string) {
    if (subnetmask) {
      if (ipOrCidr.includes('/')) {
        throw new Error('Invalid IP address format. CIDR notation is not allowed here.');
      }
      this.ip = new IPAddress(ipOrCidr).ip;
      this.subnetmask = new IPAddress(subnetmask).ip;
    } else {
      if (!ipOrCidr.includes('/')) {
        throw new Error('Invalid input. CIDR notation is expected when only one argument is provided.');
      }
      const [ip, cidr] = ipOrCidr.split('/');
      this.ip = new IPAddress(ip).ip;
      this.subnetmask = new IPAddress(IPAddress.numberToIp((2 ** (32 - parseInt(cidr)) - 1) >>> 0)).ip;
    }
  }

  /**
   * ネットワークアドレスを取得する
   * @returns ネットワークアドレスの文字列
   */
  getNetworkAddr(): number {
    return (this.ip & this.subnetmask) >>> 0;
  }

  /**
   * ブロードキャストアドレスを取得する
   * @returns ブロードキャストアドレスの文字列
   */
  getBroadcastAddr(): number {
    return (this.ip | ~this.subnetmask) >>> 0;
  }

  /**
   * 利用可能なホストのIPアドレス範囲を取得する
   * @returns 利用可能なホストのIPアドレス範囲の文字列
   */
  getUsableIpRange(): { start: string; end: string } {
    const start = IPAddress.numberToIp(this.getNetworkAddr() + 1);
    const end = IPAddress.numberToIp(this.getBroadcastAddr() - 1);
    return { start, end };
  }

  /**
   * ネットワーク内のアドレス数を取得する
   * @returns ネットワーク内のアドレス数
   */
  getAddressCount(): number {
    return this.getBroadcastAddr() - this.getNetworkAddr() + 1;
  }

  /**
   * ネットワーク内のホストの数を取得する
   * @returns ネットワーク内のホストの数
   */
  getHostAddressCount(): number {
    return this.getAddressCount() - 2;
  }

  /**
   * ネットワークの情報を表示する
   */
  printNetworkInfo(): void {
    const ipClass = new IPAddress(IPAddress.numberToIp(this.ip)).getClass();
    const subnetmask = CidrRange.cidrToMask(IPAddress.ipToCidr(new IPAddress(IPAddress.numberToIp(this.subnetmask))));
    const { start, end } = this.getUsableIpRange();

    console.log(`
        IPアドレス: ${IPAddress.numberToIp(this.ip)}
        サブネットマスク: /${IPAddress.ipToCidr(new IPAddress(IPAddress.numberToIp(this.subnetmask)))} (${subnetmask})
        ネットワークアドレス: ${IPAddress.numberToIp(this.getNetworkAddr())}
        使用可能IP: ${start} 〜 ${end}
        ブロードキャストアドレス: ${IPAddress.numberToIp(this.getBroadcastAddr())}
        アドレス数: ${this.getAddressCount()}
        ホストアドレス数: ${this.getHostAddressCount()}
        IPアドレスクラス: ${ipClass}
      `);
  }
}
