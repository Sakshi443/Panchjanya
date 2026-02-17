// src/types/sthanType.ts
export interface SthanType {
    id: string;
    name: string;
    color: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSthanTypeInput {
    name: string;
    color: string;
    order: number;
}

export interface UpdateSthanTypeInput {
    name?: string;
    color?: string;
    order?: number;
}
