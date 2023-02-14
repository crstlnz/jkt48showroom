type IDateRangeType = "weekly" | "monthly" | 'quarterly';

type IDateRange = {
  from: string;
  to: string;
};

type StatsOptions = {
  room_id?: number | number[];
  "live_info.end_date": object;
  is_dev?: null | boolean;
};
interface IStatMember {
  room_id: number;
  name: string;
  img: string;
  url: string;
  point: number;
  live_count: number;
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
  date: {
    from: string;
    to: string;
  };
}
