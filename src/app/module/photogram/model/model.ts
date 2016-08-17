module starter {

	export interface IAppRootScope extends ng.IRootScopeService {
		facebookConnected: boolean
		appVersion: string
		cropPhoto: string
	}


	/**
	 * This interface mirrors the Parse.File API to allow compatibility with using Parse or a custom backend
	 */
	export interface IFile {
		/**
		 * Gets the url of the file.
		 * @method url
		 */
		url : () => string
		/**
		 * Gets the name of the file.
		 * @method name
		 */
		name : () => string
	}

	export interface ILocation {
		longitude: number
		latitude: number
	}

	/**
	 * This interface mirrors the Parse.Object API to allow compatibility with using Parse or a custom backend
	 */
	export interface IBase {

		/** The primary key of the object */
		id: string

		/** The date the object was created */
		createdAt: Date

		/** The date the object was last updated */
		updatedAt: Date
	}

	/**
	 * @typedef {Object} User
	 */
	export interface IUser extends IBase {
		/**
		 * undefined if the email verification is not required,
		 * false if verification is still required
		 * true if verified
		 */
		emailVerified: boolean

		/** An array of the ids of the Match objects which are a mutual match */
		matches: string[]

		/** The profile for this user */
		profile: IProfile

		/** The status of the user account, eg banned, deleting. undefined by default. */
		status: string

		/** If the user is an administrator */
		admin: boolean

		/** If the user has a premium account (e.g. in-app purchase/subscription) */
		premium: boolean

		/** The number of credits a user has (e.g. from in-app purchase) */
		credits: number
	}

	/**
	 *
	 */
	export interface IProfile extends IBase {

		/** @property {string} uid - the id of the user who's profile this is */
		uid: string


		// Profile data

		/** The first name of the user */
		name: string

		/** The birthdate of the user */
		birthdate: Date

		/** The gender of the user. 'M' or 'F' is supported */
		gender: string

		/** Some information the user has provided about themself */
		about: string

		/** The user profile photos */
		photos: IFile[]

		/** If the user should show up in potential matches for other users */
		enabled: boolean

		/** The geo location of the user */
		location: ILocation


		// Search filters

		/** How far to search for potential matches in kilometers */
		distance: number

		/** If the user wants males to show up in their search results */
		guys: boolean

		/** If the user wants females to show up in their search results */
		girls: boolean

		/** The minimum age of people the user wants to show in their search results */
		ageFrom: number

		/** The minimum age of people the user wants to show in their search results */
		ageTo: number


		// App Settings

		/** If the location is from the GPS (otherwise manually set) */
		gps: boolean

		/** The type of the property distance. Either 'km' for kilometers or 'mi' for miles */
		distanceType: string

		/** Whether to play a sound on a new match */
		notifyMatch: boolean

		/** Whether to play a sound on a new chat message */
		notifyMessage: boolean
	}

	export interface IChat extends IBase {

	}

	export interface IMatch extends IChat {

	}

	export interface IChatMessage extends IBase {
		/** The match/chat this message is for */
		match: IMatch
		/** The users in the chat at the time of sending the message */
		userIds: string[]
		/** The id of the user who sent the message */
		sender: string
		/** The name of the user who sent the message */
		senderName: string
		text: string
		image: IFile
		audio: IFile
	}

	export interface IReport extends IBase {
		/** The user who submitted the report */
		reportedBy: IUser
		/** The user who was reported */
		reportedUser: IUser
		/** (optional) the Match/Chat being reported about if already a mutual match */
		match: IMatch
		/** The Profile of the user being reported */
		profile: IProfile
		/** (optional) A particular photo URL that was reported */
		photo: string
		/** The reason for reporting */
		reason: string
		/** What action was taken by the admin (e.g. delete photo, warn, none, ban user) */
		actionTaken: string
		/** The admin user which took the action */
		actionUser: IUser
	}
}
