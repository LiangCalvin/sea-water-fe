export interface Transaction {
    data?: TransactionData;
}

export interface Study {
    data?: StudyData;
}

export interface TransactionData {
    transactionId?: string;
}

export interface StudyData {
    studyId?: string;
    studyCode?: string;
}

export interface TransactionConfigResponse {
    data: TransactionConfig;
}

export interface TransactionConfig {
    sequenceFlow: string;
    transactionStep: string;
    status: string;
}