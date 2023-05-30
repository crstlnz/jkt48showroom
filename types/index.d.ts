type OrderType = 1 | -1;
type sortType = "date" | "gift" | "views" | "duration"
interface RecentsQuery {
  sort?: string;
  order?: number;
  search?: string;
  page?: number;
  perpage?: number;
  filter?: "graduated" | "active" | "all";
}

interface ILiveInfo {
  penonton: {
    peak: number;
  };
  start_date: string;
  end_date: string;
}
interface IShowroomRecents {
  // _id: string;
  data_id: string;
  created_at: string;
  live_info: ILiveInfo;
  room_id: number;
  total_point: number;
  room_info: {
    name: string;
    img: string;
    url: string;
    member_data: {
      isGraduate: boolean;
      img: string;
    };
  };
}

interface IRoomLive {
  name: string;
  img: string;
  img_alt?: string;
  url: string;
  room_id: number;
  is_graduate: boolean;
  is_group: boolean;
  room_exists: boolean;
  started_at: string | number;
  streaming_url_list: ShowroomAPI.StreamingURL[];
}

// _id: '6245e2fe1a8860fba4cdaccd',
// name: 'Lyn /リーン（JKT48）',
// img: 'https://image.showroom-cdn.com/showroom-prod/image/room/cover/261d835846ccd54052d7bede79f89171d1f79af054ada2fecf81086644ff6ea4_m.jpeg?v=1648711909',
// url: '/JKT48_Lyn',
// room_id: 400717,
// ok: 1,
// is_onlive: true,
// start_date: 1659195202,

interface INextLive {
  name: string;
  img: string;
  img_alt?: string;
  url: string;
  room_id: number;
  is_graduate: boolean;
  room_exists: boolean;
  is_group: boolean;
  date: string;
}

interface IMember {
  name: string;
  img: string;
  img_alt?: string;
  url: string;
  description?: string;
  group?: string;
  room_id: number;
  room_exists: boolean;
  is_graduate: boolean;
  is_group: boolean;
}

interface IRecent {
  data_id: string;
  member: {
    name: string;
    img: string;
    img_alt?: string;
    url: string;
    is_graduate: boolean;
  };
  created_at: string;
  live_info: {
    duration : number;
    viewers?: number;
    date: {
      start: string;
      end: string;
    };
  };
  room_id: number;
  points: number;
}

interface IApiRecents {
  recents: IRecent[];
  page: number;
  perpage: number;
  total_count: number;
}

interface IHomeData {
  data: IShowroomStats;
  recents: IRecent[];
}

interface ApiShowroomLive {
  _id: string;
  data_id: string;
  created_at: string;
  live_info: {
    penonton: {
      peak: number;
    };
    start_date: string;
    end_date: string;
  };
  room_id: number;
  total_point: number;
  room_info: {
    img?: string;
    url: string;
    name: string;
    member_data?: {
      isGraduate: boolean;
      img: string;
    };
  };
}

interface APILiveInfo {
  name: string;
  room_id: number;
  live_id?: number;
  started_at?: string;
  is_birthday?: boolean;
  viewers?: number;
  is_live?: boolean;
  url?: string;
  is_error: boolean;
}

interface CanvasWorker {
  type: "canvas";
  canvas: HTMLCanvasElement;
}

interface CommandWorker {
  type: "setFans" | "setFansAvatar";
  imageData?: {
    size: {
      width: number;
      height: number;
    };
    id: number;
  };
  data: any;
}

type WorkerMessage = CanvasWorker | CommandWorker;

interface NotifData {
  id : number;
  title? : string;
  message : string;
  type : 'danger' | 'warn' | 'success' | 'info'
  duration? : number,
  remainingTime: number
  action ? : ()=> any
}

interface Dialog {
  id: number;
  title?: string;
  message?: string;
  positiveText? : string;
  image?: string;
}

type DialogVariants = AlertDialog | ConfirmDialog | LoadingDialog

interface AlertDialog extends Dialog {
  type : 'alert'
  autoClose? : boolean;
  duration?: number;
}

interface ConfirmDialog extends Dialog{
  type : 'confirm'
  negativeText?: string;
  onCancel? : () => void;
  onConfirm? : () => void;
}

interface LoadingDialog extends Dialog{
  type : 'loading'
  onFinish? : () => void;
}

interface MenuItem {
  title: string
  url: string
  mobile: boolean
  login? : boolean
  icon: string
  admin? : true
  activeIcon: string
}

interface SortData {
  title: {
    asc: string
    desc: string
    btn: string
  }
  id: sortType
}

declare module "vue-virtual-scroller";
declare module "cors";
declare module "vue-twitter-timeline";
declare module 'hls.js/dist/hls.min.js';

declare function useNuxtApp(): NuxtApp & {$device : any};