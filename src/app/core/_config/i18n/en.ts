﻿// USA
export const locale = {
	lang: 'en',
	data: {
		Modules: 'Modules',
		Translator: {
			Select: 'Select your language',
			Turkish: 'Turkish',
			English: 'English'
		},

		Menu: {
			New: 'New',
			Actions: 'Actions',
			CreatePost: 'Create New Post',
			Reports: 'Reports',
			Apps: 'Apps',
			Dashboard: 'Dashboard',

			Transportation: {
				Title: 'Transportation',
				Campaign: {
					Title: 'Campaign',
					CampaignDefinition: 'Campaign Definition',
				},
				Txn: {
					Title: 'Transaction',
					ProvisionMonitoring: 'Provision Monitoring',
				},
			},
			Common: {
				Title: 'System',
				Member: {
					Title: 'Member',
					HolidayList: 'Holiday List',
					InstitutionDefinition: 'Institution Definition',
					MessageTemplateDef: 'Message Template Definition',
					CfgDashboard: 'Dashboard',
				},
				Transaction: {
					Title: 'Transaction',
					TxnResponseCodeDef: 'Response Code Definition',
					MaskedCardMonitoring: 'Masked Card Monitoring',
					TxnIrcDef: 'IRC Definitions',
				},
				Msn: {
					Title: 'Messenger',
					MsnMessageTemplateDef: 'Message Template Definition',
					MessagePoolMonitoring: 'Message Monitoring',
				},
				Auth: {
					Title: 'Authority',
					ApiDefinition: 'API Definition',
					MenuTree: 'Menu Tree',
					UserRoleDefinition: 'User Role Definition',
					UserDefinition: 'User Definition',
					ChangePassword: 'Change Password',
				},
				Workflow: {
					Title: 'Workflow',
					WorkflowDefinition: 'Workflow Definition',
					WorkflowProcess: 'Workflow Process',
				},
				Jobchain: {
					Title: 'Job Chain',
					JobChainDefinition: 'Job Chain Definition',
					JobChainMonitoring: 'Job Chain Monitoring and Execution',
					JobChainExecutionHistory: 'Job Chain Execution History',
					JobChainErrorPool: 'Job Chain Error Pool',
					CrystalQuartz: 'Crystal Quartz',
				},
				DynamicQueryBuilder: {
					ConfigDefinition: 'Config Definition'
				},
				Monitoring: {
					Title: 'Monitoring',
					ApiCallLog: 'Log Monitoring',
					History: 'History',
				},
				Parameter: {
					Title: 'Parameter'
				}
			},
		},

		Transportation: {
			Card: {
				PtcnSearch: 'Ptcn Search',
			},
			Transaction: {
				StartDate: 'Start Date',
				EndDate: 'End Date',
				Currency: 'Currency',
				TransactionDate: 'Txn Date',
				TransactionTime: 'Txn Time',
				TransactionAmount: 'Txn Amount',
				BankCode: 'Bank Code',
				DebtRecoveryReferenceNo: 'DebtRecoveryReferenceNo',
				TxnGuid: 'Txn Id',
				Ptcn: 'Ptcn',
				CardEncrypted: 'Encrypted Card',
				CardMask: 'Masked Card',
				ClearCard: 'Clear Card No',
				KeyType: 'Key Type',
				F01MessageType: 'Message Type-F01',
				F02: 'Pan Number-F02',
				F03: 'Processing Code-F03',
				F04: 'Txn Amount-F04',
				F04Org: 'Original Txn Amount-F04Org',
				F49: 'Currency',
				F06: 'Settle Amount-F06',
				F06Org: 'Original Settle Amount-F06Org',
				F51: 'Billing Currency-F51',
				F07: 'Transmission Date-F07',
				F09: 'F09',
				F11TraceNumber: 'Trace Number-F11',
				Stan: 'Stan',
				F13: 'Txn Date',
				F12: 'Txn Time',
				F14: 'Card Expiry Date',
				F18: 'MCC',
				F22: 'Pos Entry Mode',
				F23PanSeqNo: 'Pan Seq No-F23',
				F26BusinessCode: 'F26BusinessCode',
				F31AcqReference: 'F31AcqReference',
				F32: 'Acq Id-F32',
				F33FwdId: 'F33FwdId',
				F35TrackData: 'Track Data-F35',
				F37: 'RRN',
				F38: 'Auth Code',
				F39: 'Response Code',
				F41: 'Terminal Id',
				F42: 'Merchant Id',
				F43: 'Merchant Info',
				F43AcceptorLocation: 'Acceptor Location-F43',
				F43Name: 'Merchant Name',
				F43City: 'Merchant City',
				F43Country: 'Merchant Country',
				F43PostalCode: 'Merchant Postal Code',
				F43RegionCode: 'Merchant Region Code',
				F48TerminalType: 'F48TerminalType',
				F54AdditionalAmount: 'Additional Amount-F54',
				F55EmvData: 'F55EmvData',
				F60ReversalCode: 'Reversal Code-F60',
				F61PosData: 'Pos Data-F61',
				CreateDate: 'Create Date',
				Mcc: 'Mcc',
				F4: 'Txn Amount',
				F6: 'Settle Amount',
				FileId: 'File Id',
				TxnSource: 'Txn Source',
				TxnType: 'Txn Type',
				OfflineOnlineIndicator: 'Offline/Online Indicator',
				ErrorCode: 'Error Code',
				BankResponseCode: 'Bank Response Code',
				HasCampaign: 'Has Campaign?',
				OnlineProvisions: 'Online',
				ClearingProvisions: 'Clearing',
				ClearingFile: 'Clearing File',
				TxnDateBegin: 'Txn Date Begin',
				TxnDateEnd: 'Txn Date End',
				IsFileSuccess: 'Get Success File',
			},
			Campaign: {
				BeginDate: 'Begin Date',
				EndDate: 'End Date',
				BeginTime: 'Begin Time',
				EndTime: 'End Time',
				Weekday: 'Campaign Days',
				CardDigits: 'Card Digits',
				D042AcqId: 'D042AcqId',
				PassedNumber: 'Passed Number',
				MaxTxnAmount: 'Max Txn Amount',
				DailyTotalCount: 'Daily Total Count',
				DailyTotalAmount: 'Daily Total Amount',
				Budget: 'Budget',
				UsedBudget: 'Used Budget',
				RemainingBudget: 'Remaining Budget',
				DiscountRate: 'Discount Rate',
				CampaignId: 'Campaign Id',
				CampaignCode: 'Campaign Code',
			},

			Exception: {
				KeyTypeNotNullForClearCard: 'KeyType must be selected with clear card number.',

			},
		},

		System: {
			Member: {
				Code: 'Code',
				Name: 'Name',
				Address: 'Address',
				Address1: 'Address 1',
				Address2: 'Address 2',
				Address3: 'Address 3',
				CountryCode: 'Country Code',
				Country: 'Country',
				RegionCode: 'Region Code',
				City: 'City',
				Town: 'Town',
				DealerType: 'Dealer/Branch Type',
				PhoneNo: 'Phone No',
				ZipCode: 'Zip Code',
				IsValid: 'Is Valid',
				AccountNumber: 'Account Number',
				SuffixNumber: 'Suffix Number',
				LookupClassName: 'Lookup Class Name',
				ScreenOrder: 'Screen Order',
				ExpiryPeriodInMonth: 'Expiry Period In Month',
				ChannelCode: 'Channel Code',
				IsAdmin: 'Admin',
				Language: 'Language',
				InstitutionInfo: 'Member Definition',
				InstitutionConfigs: 'Member Parameters',
				TraceType: 'Type',
				FieldName: 'Field Name',
				Institution: 'Member/Institution',
				RequestDateStart: 'Request Date Start',
				RequestDateEnd: 'Request Date End',
				ContentHeader: 'Content Header',
				TimelineContent: 'Announcement Content',
				PictureFile: 'Picture File',
				SqlQuery: 'Query',
				ActionName: 'Action Name (InterfaceName.MethodName)',
				Request: 'Request Object',
				Execute: 'Execute',
				IsSuccess: 'Is Success',
				RunDate: 'Execution Date',
				RunTime: 'Execution Time',
				StartDate: 'Start Date',
				EndDate: 'End Date',
				Highlight: 'Highlight',

				Exception: {
					StartDateCanotBeGretarThanEndDate: 'Start Date Cannot Be Gretar Than End Date',
					DifferenceBetweenDatesCannotExeedDays: 'Difference Between Dates Cannot {1} ExeedDays',
					PlaseEntryStartAndEndDate: 'Plase Entry Start and End Date',
				},
			},
			DynamicQueryBuilder: {
				ARulesetCannotBeEmpty: 'A ruleset cannot be empty. Please add a rule or remove it all together.',
				TxnDefinition: 'Txn Definition',
				TxnSource: 'Txn Source',
				TxnDate: 'Txn Date',
				AllCriterias: 'All Criterias',
				DefinedCriterias: 'Defined Criterias',
				ConfigList: 'Config List',
				ConfigType: 'Config Type',
				InstallType: 'Install Type',
				Summary: 'Summary',
				Detail: 'Detail',
				IsValid: 'Is Valid',
				Product: 'Product',
				Country: 'Country',
				TxnRegion: 'Region',
				ChannelCode: 'Channel Code',
				Currency: 'Currency',
				TxnAmount: 'Transaction Amount',
				MerchantGroup: 'Merchant Group',
				MerchantCode: 'Merchant Code',
				MerchantChainCode: 'Merchant Chain Code',
				Mcc: 'MCC',
				MccGroup: 'MCC Group',
				McTcc: 'MC TCC',
				Bin: 'BIN',
				CardType: 'Card Type',
				Exception: {
				},
			},
			Authority: {
				UserRole: 'User Role',
				AuthorizationType: 'Authorization Type',
				RoleType: 'Role Type',
				Authorized: 'Authorized',
				ReadOnly: 'ReadOnly',
				Unauthorized: 'Unauthorized',
				MenuUrl: 'Menu URL',
				NewMenuName: 'New Menu Name',
				ParentMenuName: 'Parent Menu Name',
				MenuName: 'Menu Name',
				ApiDefinition: 'API Definition',
				Api: 'API-Service',
				Menus: 'Menus',
				Apis: 'APIs-Services',
				AuthenticationLevel: 'Authentication Level',
				OldPassword: 'Old Password',
				NewPassword: 'New Password',

				Exception: {

				},
			},
			Workflow: {
				ApiMethod: 'API Method',
				ExpireDayCount: 'Expire Day Count',
				IsFinalizeProcess: 'Is Finalize Process',
				StateDefinition: 'State Definition',
				State: 'State',
				Save: 'New Record',
				Update: 'Update',
				Delete: 'Delete',
				ConfigFile: 'Config File',
				Waiting: 'Waiting',
				IfFirstStateIsFlowCanBeTerminated: 'If first state, is flow can be terminated?',

				Exception: {
				},
			},
			JobChain: {
				JobChainList: 'Job Chain List',
				JobChainExecutionAndMonitoring: 'Job Chain Execution and Monitoring',
				JobChainDefHasToBeForTreeDefinition: '* Job chain has to be create for job chain tree definition',
				JobChain: 'Job Chain',
				BrowserNotSupported: 'Browser is not supported for draw job chain tree.',
				ExecutionAndMonitoring: 'Execution and Monitoring',
				JobChainMustSelect: 'For view screen, job chain selection has to be.',
				Interval: 'Interval',
				MinInterval: 'Interval value should enter minimum 2000ms.',
				ShowExceptionDetail: 'Show exception detail.',
				SourceTrigger: 'SourceTrigger',
				TargetTrigger: 'Target Trigger',
				SingleRun: 'Single Run',
				SingleRunError: 'End-of-day first step can only be run sequentially',
				RunWithOrder: 'Run With Order',
				ViewExecutionHistory: 'View Execution History',
				ViewProcessErrorPool: 'View error processes',
				Refresh: 'Refresh',
				CreateTrigger: 'Create Trigger',
				CreateFlow: 'Create Flow',
				AreYouSureSkipOneTime: 'Job stat set to be \'Finished\'. Do you confirm?',
				TriggerStatUpdating: 'Stat updating.',
				TriggerRunRequest: 'Trigger Run Request',
				RunAsSingular: '{0} job will be run singular. Do you confirm?',
				RunAsSequential: '{0} job will run as sequential. Do you confirm?',
				JobIsRunning: 'Job is running, please wait.',
				JobRunSuccessfully: 'Job run successfully.',
				TriggerGroupDeleteError: 'To delete the group, you must first delete all the triggers under it.',
				TriggerMustNotSamePrevTrigger: 'Trigger must not same Prev Trigger',
			}
		},

		General: {
			ApplicationName: 'Transportation Payment System',
			ParentApplication: 'Parent Application',
			ClickForDetails: 'Click for details',
			Approve: 'Approve',
			Reject: 'Reject',
			Export: 'Export',
			Open: 'Open',
			Close: 'Close',
			Back: 'Back',
			BackToList: 'Back to List',
			Save: 'Save',
			Preview: 'Preview',
			SaveAndContinue: 'Save & Continue',
			Get: 'Get',
			Refresh: 'Refresh',
			RefreshInterval: 'Refresh Interval',
			Clear: 'Clear',
			Cancel: 'Cancel',
			Edit: 'Edit',
			View: 'View',
			Delete: 'Delete',
			ResetChanges: 'Reset Changes',
			Search: 'Search',
			Copy: 'Copy',
			CopyRecord: 'Copy Record',
			Expire: 'Expire',
			Accept: 'Accept',
			Print: 'Print',
			DownloadSample: 'Download Sample',
			PleaseWaitWhileProcessing: 'Please wait while processing',
			SearchInAllFields: 'Search in all fields',
			Filter: 'Filter',
			Add: 'Add',
			Remove: 'Remove',
			Code: 'Code',
			Description: 'Description',
			Required: 'Required ',
			CreateNew: 'Create New',
			Update: 'Update',
			New: 'New',
			All: 'All',
			FetchSelectedRecords: 'Fetch Selected Records',
			SelectedRecordsCount: 'Selected Records Count',
			NoRecordsFound: 'No Records Found.',
			NoRecord: 'No Record',
			Actions: 'Actions',
			ItemsPerPage: 'Items per page',
			RecordCount: 'Record Count',
			FirstPage: 'First Page',
			LastPage: 'Last Page',
			NextPage: 'Next Page',
			PreviousPage: 'Previous Page',
			Confirmation: 'Confirmation',
			MemberId: 'Member Id',
			ReferanceMemberId: 'Referance Member Id',
			Yes: 'Yes',
			No: 'No',
			Send: 'Send',
			ShowRecord: 'Show Record',
			SuccessfullyUpdated: 'Successfully Updated.',
			SuccessfullyCreated: 'Successfully Created.',
			SuccessfullyCloned: 'Successfully Cloned.',
			ClonedSuccessDetail: 'New clearing record which based on selected has been created. Redirect to update screen',
			UpdateUnsuccess: 'Update Unsuccess',
			Choose: 'Choose',
			Select: 'Select',
			SelectAll: 'Select All',
			PleaseEnter: 'Please Enter ',
			Monday: 'Monday',
			Tuesday: 'Tuesday',
			Wednesday: 'Wednesday',
			Thursday: 'Thursday',
			Friday: 'Friday',
			Saturday: 'Saturday',
			Sunday: 'Sunday',
			ErrorCount: 'Error Count',
			Load: 'Load',
			Loading: 'Loading',
			Completed: 'Completed',
			History: 'History',
			Report: 'Report',
			Confirm: 'Confirm',
			Calculate: 'Calculate',
			None: 'None',
			ShowDetails: 'Show Details',
			Details: 'Details',
			Detail: 'Detail',
			DeleteSelectedRecords: 'Delete Selected Records',
			UpdateSelectedRecords: 'Update Selected Records',
			FileName: 'File Name',
			FileLoad: 'File Load',
			FileChoose: 'File Choose',
			LoadFromFile: 'Load From File',
			Next: 'Next',
			Previous: 'Previous',
			LastUpdated: 'Lastupdated',
			IsOpen: 'Is Open',
			PleaseSelect: 'Please Select ',
			PleaseSelectRecord: 'Please Select Record',
			Name: 'Name',
			Midname: 'Mid Name',
			Surname: 'Surname',
			Priority: 'Priority',
			AddNew: 'Add new',
			ErrorCode: 'Error Code',
			ErrorMessage: 'Error Message',
			ValidationMessages: 'Validation Messages',
			ExpireDate: 'Expire Date',
			InvalidData: 'Invalid Data',
			InsertUser: 'Insert User',
			InsertDate: 'Insert Date',
			InsertTime: 'Insert Time',
			InsertDateTime: 'Insert DateTime',
			UpdateUser: 'Update User',
			UpdateDate: 'Update Date',
			UpdateTime: 'Update Time',
			UpdateDateTime: 'Update DateTime',
			ProcessKey: 'Process Key',
			ProcessStatus: 'Process Status',
			ProfileDetail: 'Profile Detail',
			WorkflowReferenceNo: 'Reference No',
			ReferenceNo: 'Reference No',
			TraceId: 'Trace Id',
			CorrelationId: 'Correlation Id',
			ReferenceId: 'Reference Id',
			SessionTimeout: 'Session Timeout',
			YourSessionIsAboutToExpire: 'Your session is about to expire.',
			LogoutIn: 'Logout in',
			Seconds: 'Seconds',
			Logout: 'Logout',
			StayConnected: 'Stay Connected',
			MoreActions: 'More Actions',
			ErrorDescription: 'Error Description',
			UserCode: 'User Code',
			ApproveUser: 'Approved User',
			ApproveDate: 'Approved Date',
			ApproveRejectUser: 'Approve/Reject User',
			ApproveRejectDate: 'Approve/Reject Date',
			ApproveRejectTime: 'Approve/Reject Time',
			ActionDate: 'Action Date',
			ActionTime: 'Action Time',
			ActionChannel: 'Action Channel',
			IsActive: 'Is Active',
			Proiority: 'Proiority',
			Active: 'Active',
			Passive: 'Passive',
			OrderNo: 'Order No',
			IconName: 'Icon Name',
			ReadOnly: 'Read Only',
			RoleName: 'Rol Name',
			RelatedScreens: 'Related Screens',
			BadnessDegree: 'Badness Degree',
			ClassName: 'Class Name',
			Guid: 'Guid',
			Irc: 'IRC',
			MaxLimit: 'Max Limit',
			MinLimit: 'Min Limit',
			MessageType: 'Message Type',
			MethodArgs: 'Method Args',
			MethodDescription: 'Method Description',
			Order: 'Order',
			RequestDate: 'Request Date',
			RequestTime: 'Request Time',
			ResponseCode: 'Response Code',
			ResponseDate: 'Response Date',
			ResponseTime: 'Response Time',
			Status: 'Status',
			TimeElapsed: 'Time Elapsed',
			TransactionGuid: 'Transaction Guid',
			Version: 'Version',
			Value: 'Value',
			ApiPermission: 'Api Authorization',
			MenuPermission: 'Menu Authorization',
			DefaultCurrencyCode: 'Default Currency Code',
			MaskedCardNo: 'Masked Card No',
			CardBrand: 'Card Brand',
			CardDci: 'Card DCI',
			CardSource: 'Card Source',
			ExpiryDate: 'Expiry Date',
			PreviousExpiryDate: 'Previous Expiry Date',
			Total: 'Total',
			EodDate: 'Eod Date',
			StartDate: 'Start Date',
			StartTime: 'Start Time',
			EndDate: 'End Date',
			EndTime: 'End Time',
			ChooseAStartDate: 'Choose a start date',
			ChooseAEndDate: 'Choose a end date',
			HolidayName: 'Holiday Name',
			HolidayDate: 'Holiday Date',
			HolidayDay: 'Holiday Day',
			HolidayMonth: 'Holiday Month',
			VariableHoliday: 'Variable Holiday',
			ConstantHoliday: 'Constant Holiday',
			FileDate: 'File Date',
			CountryCode: 'Country Code',
			CountryName: 'Country Name',
			CountryCodeNumeric: 'Country Code (Numeric)',
			CountryCodeIso: 'Country Code (ISO)',
			ServiceIndustry: 'Service Industry',
			StateProvinceCode: 'State / Province Code',
			Region: 'Region',
			Issuer: 'Issuer',
			Acquirer: 'Acquirer',
			IssuerAcquirer: 'Issuer/Acquirer',
			CityCode: 'City Code',
			City: 'City',
			TownCode: 'Town Code',
			Town: 'Town',
			PostCode: 'Post Code',
			HomePhone: 'Home Phone',
			Email: 'Email',
			BirthDate: 'Birth Date',
			BirthPlace: 'Birth Place',
			Explanation: 'Explanation',
			IsDeferred: 'Is Deferred',
			NoFileChoosen: 'No File Choosen!',
			Success: 'Success',
			Unsuccess: 'Unsuccess',
			Error: 'Error',
			FilterByStatus: 'Filter by Status',
			ErrorExplanation: 'Error Explanation',
			ActiveFlag: 'Active Flag',
			MemberName: 'Member Name',
			ReportType: 'Report Type',
			TxnDate: 'Txn Date',
			TxnTime: 'Txn Time',
			ProcessDate: 'Process Date',
			ProcessTime: 'Process Time',
			FileProcessDate: 'File Process Date',
			FileProcessTime: 'File Process Time',
			Normal: 'Normal',
			Void: 'Void',
			Quantity: 'Quantity',
			ApiRoute: 'Api Route',
			ApplicationId: 'Application',
			ExcelExportAll: 'Excel (All)',
			ExcelExportCurrent: 'Excel (Current)',
			Parameters: 'Parameters Value',
			ScreenName: 'Screen Name',
			CollapseGroup: 'Group Collapse',
			ExpandGroup: 'Group Expand',
			Other: 'Other',
			ParentGuid: 'Parent ReferenceId',
			RequestKey: 'Request Key',
			LogApplicationName: 'Application Name',
			ActionName: 'Action Name',
			HttpMethod: 'Http Method',
			HttpStatusCode: 'Http Status Code',
			Direction: 'Direction',
			ElapsedMs: 'Elapsed Milisecond',
			EventName: 'Event Name',
			DeviceId: 'Device Id',
			MachineName: 'Machine Name',
			RequestHeader: 'Request Header',
			Request: 'Request',
			Response: 'Response',
			SessionGuid: 'Session Guid',
			ExceptionCode: 'Exception Code',
			DropColumnDescription: 'Drop a column header here to group by the column',
			TableName: 'Table Name',
			Key: 'Key',
			EmployeeId: 'Employee Id',
			Restriction: 'Restriction',
			RestrictionProfile: 'Restriction Profile',
			TicketType: 'Auth Type',
			AuthType: 'Entry Type',
			IsBuiltInUser: 'Built-in User (multisession)',
			SessionDuration: 'Session Duration (minute)',
			ValidPasswordRegex: 'Password Regex',
			BlockWrongPasswordCount: 'Block Wrong Password Count',
			MobileNumber: 'Mobile Phone',
			LastLoginDateTime: 'Last Login Time',
			IncorrectPasswordEntries: 'Incorrect Password Entries',
			LastPasswordChangeDate: 'Last Password Change Date',
			EnteredPassword: 'Entered Password',
			LastPasswordResetDate: 'Last Password Reset Date',
			NewPassword: 'New Password',
			UserStat: 'User Stat',
			Id: 'Id',
			Operator: 'Operator',
			RecordsPendingApproval: 'Records Pending Approval',
			RecordsSentToApproval: 'Records Sent To Approval',
			UpdatedVersion: 'Updated Version',
			CurrentVersion: 'Current Version',
			CollapseAll: 'Collapse All',
			ExpandAll: 'Expand All',
			UnblockPin: 'Remove Cvv2 Block',
			OldValue: 'Old Value',
			NewValue: 'New Value',
			AddedValue: 'Added',
			DeletedValue: 'Deleted',
			UpdatedValue: 'Updated',
			WillBeMasked: 'Will Card Be Masked',
			Pos: 'POS',
			Vpos: 'VPOS',
			Bkm: 'BKM',
			willBeMasked: 'Will Card Be Masked',
			RowNumber: 'Row Number',
			ProcessUser: 'Process User',

			DeleteConfirmation: 'Delete Confirmation!',
			AreYouSureToPermanentlyDeleteThisRecord: 'Are you sure to permanently delete this record',
			RecordIsBeingDeleted: 'Record is being deleted...',
			RecordHasBeenDeleted: 'Record has been deleted',

			Exception: {
				PleaseEnterASearchCriteria: 'Please enter a search criteria.',
				PleaseFillAllTextBoxes: 'Please fill all text boxes.',
				InputMustBeGreaterThanZero: 'Input must be greater than zero : {0}',
				SavingConfirmMessage: 'A new record will be created. Do you confirm?',
				UpdatingConfirmMessage: 'Changes will be saved. Do you confirm?',
				ProfileCannotDeleteMessage: 'There are data to which the specified profile is associated in the system. Firstly you must delete all of these relationships from the <strong>System Profile Configurations</strong> and <strong>Card Profile Map</strong> screens.',
				FileUploadedSuccessfully: 'File uploaded successfully.',
				ErrorOccurredLoodingFile: 'An error occurred while loading the file.',
				PleaseEnterDescription: 'Please enter description.',
				PleaseEnterValueWithValidLength: 'Please enter value with valid length.',
				CannotDefinedMoreThanOneGroup: 'A txn definition cannot be defined in more than one group. [TXN_DEF] is defined in the [GROUP_DEF] group.',
				AtLeastOneCriteriaShouldBeSelected: 'At Least One Criteria Should Be Selected',
				RowExistsWithSameDetails: 'Row Exist With Same Details',
				SelectAUserRole: 'Select at least one user role.',
				EnterAtLeastOneValue: 'Enter at least one value',
			},
		},

		Auth: {
			General: {
				Or: 'Or',
				SubmitButton: 'Submit',
				NoAccount: 'Don\'t have an account',
				SignupButton: 'Signup',
				ForgotButton: 'Forgot Password',
				BackButton: 'Back',
				Privacy: 'Privacy',
				Legal: 'Legal',
				Contact: 'Contact',
			},
			Login: {
				Title: 'Sign In',
				Button: 'Sign In',
			},
			Forgot: {
				Title: 'Forgotten Password',
				Desc: 'Enter your email to reset your password',
			},
			Register: {
				Title: 'Sign Up',
				Desc: 'Enter your details to create your account',
				Success: 'Your account has been successfuly registered. Please use your registered account to login.',
				PassswordAndConfirmPasswordDidnotMatch: 'Passsword and ConfirmPassword did not match.',
			},
			Input: {
				Email: 'Email',
				FullName: 'Fullname',
				Password: 'Password',
				ConfirmPassword: 'Confirm Password',
				InstitutionId: 'Member Id',
				UserCode: 'User Code',
				UserInfo: 'User Info',
			},
			Validation: {
				AgreementRequired: 'Accepting terms & conditions are required',
				NotFound: 'The requested {{name}} is not found',
				InvalidLogin: 'The login detail is incorrect',
				PasswordMismatch: 'Wrong password',
				Error: 'Cannot connect api url',
				NotAuthorized: 'Not Authorized.',
				TryAgain: 'Please try again.',
				RequiredField: 'Required Field',
				InvalidField: 'Invalid Field',
				MinLengthField: 'Min Length Field',
				MaxLengthField: 'Max Length Field',
			},
			Exception: {
				LdapConnectionError: 'Ldap connection error occurred'
			}
		},
	}
};
