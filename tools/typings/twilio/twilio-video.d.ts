// Partial type definition for Twilio conversations

declare namespace Twilio {

	var Conversations: IConversations

	// https://media.twiliocdn.com/sdk/js/common/releases/0.1.4/docs/AccessManager.html
	class AccessManager {
		identity:string // optional
		token:string
		isExpired:boolean
		expires:Date // optional

		constructor(initialToken:string);


		updateToken(newToken:string):Promise<AccessManager>;

		on(event:string, callback:(any));
	}


	interface IConversations {

		getUserMedia(options?:GetLocalMediaOptions):Promise<LocalMedia>;

		LocalMedia(options?:GetLocalMediaOptions):void;
		Client(accessManager:AccessManager):void;
	}


	class Client {
		constructor(managerOrToken:AccessManager | string, options?:ClientConstructorOptions);

		accessManager:AccessManager
		identity:string
		conversations
		isListening:boolean
	}

	interface ClientConstructorOptions {
		logLevel?: string // Valid values: ['off', 'error', 'warn', 'info', 'debug']
	}

	class Media {

		//attachments	Map.<HTMLElement, Map.<Track, HTMLElement>>
		//A Map from <div> elements to a Map from Tracks to their attached HTMLElements (managed by Media#attach and Media#detach)
		//audioTracks	Map.<Track.ID, AudioTrack>
		//The AudioTracks on this Media object
		//isMuted	boolean
		//True if every AudioTrack on this Media object is disabled
		//isPaused	boolean
		//True if every VideoTrack on this Media object is disabled
		//mediaStreams	Set.<MediaStream>
		//The MediaStreams associated with the Tracks on this Media object
		//tracks	Map.<Track.ID, Track>
		//The AudioTracks and VideoTracks on this Media object
		//videoTracks	Map.<Track.ID, VideoTrack>
		//The VideoTracks on this Media object

		attach():HTMLElement;
		attach(selector:string):HTMLElement;
		attach(el:HTMLElement):HTMLElement;
		detach():HTMLElement[];
		detach(selector:string):HTMLElement;
		detach(el:HTMLElement):HTMLElement;

	}

	class LocalMedia extends Media {

		static getLocalMedia(options?:GetLocalMediaOptions):Promise<LocalMedia>;

		stop(): LocalMedia;
	}

	interface GetLocalMediaOptions {
	}

	interface IncomingInvite {
		conversationSid: string
		from: string
		participants: string[]
		status: string

		accept(): Promise<Conversation>
		reject(): Promise<Conversation>
	}


	class Conversation {
		localMedia: LocalMedia
		participants//: Map.<Participant.SID, Participant>
		sid: string

		disconnect(): Conversation;
		invite(identity:string|string[]): Conversation;
		on(event:string, callback:(any));
	}

	interface Participant {
		identity: string
		media: Media
		sid: string
	}


}