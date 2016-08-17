module starter {

  import IPromise = Parse.IPromise;
  /**
   * AppService will implement this when converted to TypeScript
   */
  export interface IAppService {
    twilioAccessToken: string

    saveProfile(updates:IProfile): ng.IPromise<IProfile>
    getProfile(): IProfile
    getProfileByUserId(id:string): IProfile
    getProfilesWhoLikeMe(): ng.IPromise<IProfile[]>
    processMatch(profile:IProfile, liked:boolean): ng.IPromise<IMatch>

    // Admin functions
    getReportedUsers(): ng.IPromise<IReport[]>
    getReportedUserDetails(report): ng.IPromise<IReportDetails>
    deletePhoto(reportId:string, photoUrl): ng.IPromise<void>
    banUser(userId:string): ng.IPromise<void>
    closeReport(reportId:string, action:string): ng.IPromise<void>
    searchUsersByEmail(email:string): ng.IPromise<IUser[]>
    loadUser(id:string): ng.IPromise<IUser>
    deleteUser(userId:string): ng.IPromise<void>
    searchUsersByName(name:string): ng.IPromise<IProfile[]>
  }

  /**
   * The object type returned from IAppService.getReportedUserDetails()
   */
  export interface IReportDetails {
    allReports: IReport[]
    recentMessages: IChatMessage[]
    recentMessagesToReporter: IChatMessage[]
  }


  // Partially defined
  export interface IParseService {
    init(): ng.IPromise<void>
    getUserId(): string
    sendChatMessage(message:IChatMessage, match:IMatch): ng.IPromise<IChatMessage>
    getTwilioToken(): ng.IPromise<string>
  }

  // Partially defined
  export interface ILocalDBService {
    init(): ng.IPromise<void>
    getUnreadChats(): ng.IPromise<any>
    setChatRead(chatId: string, read: boolean): ng.IPromise<void>
    saveChatMessage(msg: IChatMessage, match:IMatch): ng.IPromise<boolean>
  }
}
