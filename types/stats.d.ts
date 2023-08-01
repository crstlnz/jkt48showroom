type IDateRangeType = "weekly" | "monthly" | 'quarterly';
type IDateRangeMemberType = "weekly" | "monthly" | 'all';

type IDateRange = {
  from: string;
  to: string;
};

type StatsOptions = {
  room_id?: number | number[];
  "live_info.end_date"?: object | undefined;
  is_dev?: null | boolean;
};
interface IStatMember {
  room_id: number;
  name: string;
  img: string;
  url: string;
  point: number;
  most_point: number;
  live_count: number;
  duration : number;
  most_viewer : number;
  total_viewer: number;
}

interface IFans {
  id: number;
  name: string;
  avatar_id: number;
}

interface IStatFans {
  id: number;
  name: string;
  avatar_id: number;
  fans_point: number;
}

interface IStats {
  title: string;
  key?: string;
  parseType? : ParseType
  img?: {
    title: string;
    src: string;
  };
  value: string | number;
}

interface IShowroomStats {
  type: IDateRangeType;
  ranks: {
    member: StatMember[];
    fans: IStatFans[];
  };
  stats: IStats[];
  date?: {
    from: string;
    to: string;
  }| undefined;
}


interface IShowroomMemberStats {
  type: IDateRangeMemberType;
  ranks: {
    member: StatMember[];
    fans: IStatFans[];
  };
  stats: IStats[];
  date?: {
    from: string;
    to: string;
  } | undefined;
}