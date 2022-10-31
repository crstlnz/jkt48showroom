interface IFansGift {
  name: string;
  id: number;
  avatar: string;
  avatar_id: number;
  total: number;
  gifts: IGifts[];
}

interface IFansCompact {
  id: number;
  name: string;
  avatar_id: number;
}

interface IStageFans {
  id: number;
  name: string;
  avatar: string;
}

interface IStageList {
  date: string;
  list: number[];
}

interface IScreenshotData {
  folder: string;
  format: string;
  list: number[];
}

interface ILiveDate {
  start: string;
  end: string;
}

interface IDetailLiveInfo {
  screenshot?: IScreenshotData;
  viewer: {
    history: {
      num: number;
      date: string;
    }[];
    peak: number;
  };
  background_image?: string;
  stage_list: IStageList[];
  date: ILiveDate;
  gift: IGiftsLogData;
}

interface IShowroomLogDetail {
  data_id: string;
  room_info: {
    name: string;
    img: string;
    url: string;
    is_group: boolean;
    is_graduate: boolean;
  };
  live_info: IDetailLiveInfo;
  jpn_rate?: number;
  room_id: number;
  total_point: number;
  users: IFansCompact[];
  created_at: string;
}
