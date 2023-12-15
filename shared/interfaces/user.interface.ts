export interface IUser {
	_id?: string;
	id?: string;
	username: string;
	password?: string;
	email: {
		name: string;
		verified: boolean;
	};
}
