namespace Watch {
    interface Comment {
        user_id : number;
        name : string;
        comment : string;
        created_at : number;
        avatar_id : number;
    }
    
    interface APIComment {
        ua: number;
        avatar_id: number;
        aft: number;
        avatar_url: string;
        name: string;
        created_at: number;
        comment: string;
        user_id: number;
    }
    
    interface Comment {
        id : string;
        user_id : number;
        name : string;
        comment : string;
        created_at : number;
        avatar_id : number;
    }
    
    interface WatchData {
        name : string;
        started_at : number;
        room_id : number;
        room_url_key : string;
        streaming_url_list : ShowroomAPI.StreamingURL[];
        socket_host : string;
        socket_key : string;
        socket_port : number;
        is_live : boolean;
        comments : Comment[];
        image : string;
    }
}