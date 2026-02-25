// src/types/sthanType.ts
export type PinType = 'pin_empty' | 'pin_temple1' | 'pin_shikhara' | 'pin_mandir' | 'pin_aasan' | 'pin_dot' | 'pin_mahasthan' | 'pin_1_1' | 'pin_1_2' | 'pin_1_3' | 'pin_1_4' | 'pin_1_5' | 'pin_empty_gold';

export interface SthanType {
    id: string;
    name: string;
    color: string;
    order: number;
    pinType?: PinType;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSthanTypeInput {
    name: string;
    color: string;
    order: number;
    pinType?: PinType;
}

export interface UpdateSthanTypeInput {
    name?: string;
    color?: string;
    order?: number;
    pinType?: PinType;
}
