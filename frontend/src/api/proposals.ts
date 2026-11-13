import {request,post} from './client';import type {Proposal} from '../types/domain';
export const list=()=>request<Proposal[]>('/proposals'+'');
export const create=(data:unknown)=>post<Proposal>('/proposals',data);
export const review=(id:number,status:string,reviewer_note:string)=>post<Proposal>('/proposals/'+id+'/review',{status,reviewer_note});
