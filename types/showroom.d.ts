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
  is_group: boolean;
  member_data?: I48Member;
}

interface IShowroomGift {
  gift_id: number;
  gift_name: string;
  is_delete_from_stage: boolean;
  free: boolean;
  image: string;
  point: number;
}

interface IShowroomUser {
  name: string;
  image: string;
  avatar_url: string;
  avatar_id: number;
  user_id: number;
  point: number;
  last_seen: string;
}


