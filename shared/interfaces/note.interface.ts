import { IUser } from "./user.interface";

export interface INote extends Partial<Omit<IUser, "password">> {
	user: string;
	id: string;
	title: string;
	description: string;
	completed: boolean;
	category: string;
}
