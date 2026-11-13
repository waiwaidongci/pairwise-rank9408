import {request,post} from './client';import type {Concept} from '../types/domain';
export const list=(study_id:number)=>request<Concept[]>('/concepts'+`?study_id=${study_id}`);
export const create=(data:unknown)=>post<Concept>('/concepts',data);
