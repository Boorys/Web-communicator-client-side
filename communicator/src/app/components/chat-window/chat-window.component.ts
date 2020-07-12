import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CdkVirtualScrollViewport, ScrollDispatcher } from '@angular/cdk/scrolling';
import { MessagePostDto } from 'src/app/models/MessagePostDto';
import { takeWhile, map, filter } from 'rxjs/operators'
import { of, from } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { MessageGetDto } from 'src/app/models/MessageGetDto';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {

  @Input() friendId: string
  @Input() messageComming: MessageGetDto;
  @Output() messageEmit = new EventEmitter<MessagePostDto>()
  scrollMessage: MessageGetDto[]
  @ViewChild(CdkVirtualScrollViewport) virtualScroll: CdkVirtualScrollViewport;
  userId: string

  messages: Array<MessageGetDto>;
  testMessage: string;
  messagePostDto = new MessagePostDto;
  searchPageNumber: number;

  constructor(private scrollDispatcher: ScrollDispatcher, private cd: ChangeDetectorRef, private dataService: DataService) {
    this.messages = [];
    this.searchPageNumber = 0;
  }
  ngOnChanges(messageComming: string, friendId: string) {

    if (this.friendId !== friendId) {
      this.ngOnInit()
    }
    this.messages = this.messages.concat(this.messageComming)
  }

  ngOnInit(): void {

    this.userId = localStorage.getItem("userId")
    this.dataService.getMessages(10, this.friendId).subscribe(data => {

      this.scrollMessage = data;
      this.messages = this.scrollMessage.reverse()
    }, error => {
    })
  }

  trackByFn(index, item) {
    return item;
  }

  send() {
    if (this.testMessage !== "" && this.testMessage !== undefined) {
      this.messagePostDto.textMessage = this.testMessage;
      this.messagePostDto.userId = this.userId
      this.messageEmit.emit(this.messagePostDto);
      this.messages = this.messages.concat(new MessageGetDto(this.testMessage, this.userId))
      this.testMessage = "";
      setTimeout(() => {
        this.virtualScroll.scrollToIndex(this.messages.length * 10);
      })
    }
  }

  ngAfterViewInit(): void {

    this.scrollDispatcher.scrolled().pipe(
      filter(event => this.virtualScroll.measureScrollOffset('top') === 0)
    ).subscribe(event => {

      this.searchPageNumber = this.searchPageNumber + 25;
      this.nextSearchPage(this.searchPageNumber);
      this.cd.detectChanges();
    })
  }

  nextSearchPage(pageNumber: number): void {

    let result = [];
    this.dataService.getMessages(pageNumber, this.friendId).subscribe(data => {

      this.scrollMessage = data;
      this.messages = this.scrollMessage.reverse()

    }, error => {
    })
    setTimeout(() => {
      this.virtualScroll.scrollToIndex(this.messages.length * 10);
    })
  }

  getResults(pageNumber) {

    let result = [];
    this.dataService.getMessages(1, this.friendId).subscribe(data => {

      this.scrollMessage = data;
      this.messages = this.scrollMessage.reverse()
    }, error => {
    })

    return of(result);
  }

}
