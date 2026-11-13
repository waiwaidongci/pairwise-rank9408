import {request,post} from './client';import type {Pair} from '../types/domain';
export const list=(study_id:number)=>request<Pair[]>('/pairs'+`?study_id=${study_id}`);
export const create=(data:unknown)=>post<Pair>('/pairs',data);
export const update=(id:number,data:unknown)=>request<Pair>('/pairs/'+id,{method:'PUT',body:JSON.stringify(data)});
