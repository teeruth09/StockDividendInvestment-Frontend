export enum EHttpStatusCode {
  SUCCESS = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INVALID_TOKEN = 498,
  SERVER_ERROR = 500,
}


export enum StockSector {
  AGRI = "ธุรกิจการเกษตร",
  FOOD = "อาหารและเครื่องดื่ม",
  FASHION = "แฟชั่น",
  HOME = "ของใช้ในครัวเรือนและสำนักงาน",
  PERSON = "ของใช้ส่วนตัวและเวชภัณฑ์",
  BANK = "ธนาคาร",
  FIN = "เงินทุนและหลักทรัพย์",
  INSUR = "ประกันภัยและประกันชีวิต",
  AUTO = "ยานยนต์",
  IMM = "วัสดุอุตสาหกรรมและเครื่องจักร",
  PAPER = "กระดาษและวัสดุการพิมพ์",
  PETRO = "ปิโตรเคมีและเคมีภัณฑ์",
  PKG = "บรรจุภัณฑ์",
  STEEL = "เหล็กและผลิตภัณฑ์โลหะ",
  CONMAT = "วัสดุก่อสร้าง",
  CONS = "บริการรับเหมาก่อสร้าง",
  PF_REITS = "กองทุนรวมอสังหาริมทรัพย์และ REITs",
  PROP = "พัฒนาอสังหาริมทรัพย์",
  ENERG = "พลังงานและสาธารณูปโภค",
  MINE = "เหมืองแร่",
  COMM = "พาณิชย์",
  HELTH = "การแพทย์",
  MEDIA = "สื่อและสิ่งพิมพ์",
  PROF = "บริการเฉพาะกิจ",
  TOURISM = "การท่องเที่ยวและสันทนาการ",
  TRANS = "ขนส่งและโลจิสติกส์",
  ETRON = "ชิ้นส่วนอิเล็กทรอนิกส์",
  ICT = "เทคโนโลยีสารสนเทศและการสื่อสาร",
}

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum ClusterType {
  DIVIDEND_TRAP = 'Dividend Trap (Avoid)',
  GOLDEN_GOOSE = 'Golden Goose (Strong Trend)',
  NEUTRAL = 'Sell on Fact (Neutral)',
  REBOUND_STAR = 'Rebound Star (Buy on Dip)',
  UNKNOWN = 'UNKNOWN',
}