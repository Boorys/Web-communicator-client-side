
export class MessageGetDto {

    textMessage: string;
    date: string;
    userId: string;

    constructor( textMessage: string, userId:string) {
        this.textMessage = textMessage;
        this.userId = userId;
    }

}

