export enum AllStudiesModule {
  ALL_STUDIES = 'all-studies',
  STUDY_DETAILS = 'study-details',
}

export enum StudyDetailsModule {
  RECALCULATE = 'Recalculate',
  EDIT = 'Edit',
  EXPORT = 'Export',
  DELETE = 'Delete',
  RESUBMIT = 'Resubmit'
}

export enum Status {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  CALCULATING = 'CALCULATING',
  DONE = 'DONE',
  FAILED = 'FAILED',
  PROCESSING = 'PROCESSING',
  PENDING_APPROVAL = 'PENDING APPROVAL',
  REJECTED = 'REJECTED',
  NEW = 'NEW',
  SUCCESS = 'SUCCESS',
  DELETE = 'DELETE',
  COMPLETED = 'COMPLETED'
}

export const displayStatus: Record<Status, string> = {
  [Status.PENDING]: 'PENDING',
  [Status.IN_PROGRESS]: 'IN-PROGRESS',
  [Status.DRAFT]: 'DRAFT',
  [Status.APPROVED]: 'APPROVED',
  [Status.CALCULATING]: 'CALCULATING',
  [Status.PENDING_APPROVAL]: 'PENDING APPROVAL',
  [Status.PROCESSING]: 'PROCESSING',
  [Status.DONE]: 'DONE',
  [Status.FAILED]: 'FAILED',
  [Status.REJECTED]: 'REJECTED',
  [Status.NEW]: 'NEW',
  [Status.SUCCESS]: 'SUCCESS',
  [Status.DELETE]: 'DELETE',
  [Status.COMPLETED] : 'COMPLETED'
};

export const colorStatus: Record<Status, string> = {
  [Status.PENDING]: '#E5F0F9',
  [Status.IN_PROGRESS]: '#FFCB6D',
  [Status.DRAFT]: '#E5F0F9',
  [Status.APPROVED]: '#86EFAC',
  [Status.CALCULATING]: '#B9EBFE',
  [Status.PENDING_APPROVAL]: '#B9EBFE',
  [Status.PROCESSING]: '#FFCB6D',
  [Status.DONE]: '#6BEAC5',
  [Status.FAILED]: '#FEA9A3',
  [Status.REJECTED]: '#FDA4AF',
  [Status.NEW]: '#E5F0F9',
  [Status.SUCCESS]: '#6BEAC5',
  [Status.DELETE]: '',
  [Status.COMPLETED] :'#6BEAC5'
};

export const textTooltip: Record<Status, string> = {
  [Status.DRAFT]: 'Click edit to continue editing your draft calculation.',
  [Status.PENDING]: '',
  [Status.IN_PROGRESS]:
    'Your input is being processed by the simulation system (HYSYS / Pipesim).',
  [Status.APPROVED]: '',
  [Status.CALCULATING]: '',
  [Status.DONE]: 'Simulation and calculation are complete.',
  [Status.FAILED]:
    'Simulation failed to generate output. Visit the result page for more details',
  [Status.PROCESSING]:
    'Your input is being processed by the simulation system (HYSYS / Pipesim).',
  [Status.PENDING_APPROVAL]: '',
  [Status.REJECTED]: '',
  [Status.NEW]: '',
  [Status.SUCCESS]: '',
  [Status.DELETE]: '',
  [Status.COMPLETED] : ''
};

export enum MySudiesModule {
  MY_STUDIES = 'my-studies',
}

export enum AlertMessageStudyConstants {
  EDIT_SUCCESS_TITLE = 'Study Updated Successfully',
  EDIT_SUCCESS_TEXT = 'Study updated successfully. Your changes have been saved',
  EDIT_FAILED_TITLE = 'Failed to Update Study',
  EDIT_FAILED_TEXT = 'Something went wrong while saving your changes. Please check your input and try again. If the problem persists, please contact your administrator.',
  DELETE_STUDY_SUCCESS_TITLE = 'Delete success',
  DELETE_STUDY_SUCCESS_TEXT = 'Study deleted successfully.',
  DELETE_STUDY_FAILED_TITLE = 'Failed to Delete Study',
  DELETE_STUDY_FAILED_TEXT = 'Something went wrong while deleting your study. Please check your input and try again. If the problem persists, please contact your administrator.',
  DELETE_CALCULATION_SUCCESS_TITLE = 'DELETE_CALCULATION_SUCCESS_TITLE',
}

export enum AlertMessageCalculationConstants {
  DELETE_CALCULATION_SUCCESS_TITLE = 'Delete success',
  DELETE_CALCULATION_SUCCESS_TEXT = 'Calculation deleted successfully.',
  DELETE_CALCULATION_FAILED_TITLE = 'Failed to Delete Calculation',
  DELETE_CALCULATION_FAILED_TEXT = 'Something went wrong while deleting your calculation. Please check your input and try again. If the problem persists, please contact your administrator.',
}

export enum StudyDetailConstants {
  TRANSACTIONID = 'transactionId',
  TRANSACTIONCODE = 'transactionCode',
  STATUS = 'status',
  CREATEDBY = 'createdBy',
  CREATEDAT = 'createdAt',
  UPDATEDAT = 'updatedAt',
  PIPLINERESULT = 'pipelineResult',
  TOPSIDERESULT = 'topsideResult',
}

export const StudyDetailConstantsParam: Record<StudyDetailConstants, string> = {
  [StudyDetailConstants.TRANSACTIONID]: 'transaction_id',
  [StudyDetailConstants.TRANSACTIONCODE]: 'transaction_code',
  [StudyDetailConstants.STATUS]: 'status',
  [StudyDetailConstants.CREATEDBY]: 'created_by',
  [StudyDetailConstants.CREATEDAT]: 'created_at',
  [StudyDetailConstants.UPDATEDAT]: 'updated_at',
  [StudyDetailConstants.PIPLINERESULT]: 'pipeline_result',
  [StudyDetailConstants.TOPSIDERESULT]: 'topside_result',
};

export enum StudyConstants {
  STUDYID = 'studyId',
  STUDYCODE = 'studyCode',
  STUDYNAME = 'studyName',
  STATUS = 'status',
  CREATEDBY = 'createdBy',
  CREATEDAT = 'createdAt',
  UPDATEDAT = 'updatedAt',
  ASSETNAME = 'assetName',
  LOCATIONNAME = 'locationName',
}

export const StudyConstantsParam: Record<StudyConstants, string> = {
  [StudyConstants.STUDYID]: 'study_id',
  [StudyConstants.STUDYCODE]: 'study_code',
  [StudyConstants.STUDYNAME]: 'study_name',
  [StudyConstants.STATUS]: 'status',
  [StudyConstants.CREATEDBY]: 'created_by',
  [StudyConstants.CREATEDAT]: 'created_at',
  [StudyConstants.UPDATEDAT]: 'updated_at',
  [StudyConstants.ASSETNAME]: 'asset_name',
  [StudyConstants.LOCATIONNAME]: 'location_name',
};
