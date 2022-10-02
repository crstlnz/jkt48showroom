interface IShowroomLog {
  is_dev: boolean;
  live_id: number;
  jpn_rate: number;
  data_id: string;
  live_info: {
    screenshot: {
      folder: string;
      format: string;
      list: number[];
    };
    background_image: string;
    stage_list: [
      {
        date: Date;
        list: number[];
      }
    ];
    penonton: {
      history: [
        {
          num: number;
          waktu: Date;
        }
      ];
      peak: number;
    };
    start_date: Date;
    end_date: Date;
  };
  room_id: number;
  gift_data: {
    gift_id_list: number[];
    gift_log: [
      {
        total: number;
        user_id: number;
        gifts: [
          {
            _id: false;
            gift_id: number;
            num: number;
            date: Date;
          }
        ];
      }
    ];
  };
  total_point: number;
  created_at: Date;
  users: [
    {
      _id: false;
      user_id: number;
      avatar_url: string;
      avatar_id: number;
      name: string;
    }
  ];
  room_info?: IShowroomMember;
  // room_info?: {
  //   name: string;
  //   url: string;
  //   img: string;
  //   group?: string;
  //   member_data?: I48Member;
  // };
}

interface IShowroomMember {
  name: string;
  img: string;
  img_square?: string;
  description?: string;
  group?: string;
  url: string;
  room_id: number;
  room_exists: boolean;
  is_active: boolean;
  member_data?: I48Member;
}
