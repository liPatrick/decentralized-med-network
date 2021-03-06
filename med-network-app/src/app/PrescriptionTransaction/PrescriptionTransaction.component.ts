/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { PrescriptionTransactionService } from './PrescriptionTransaction.service';
import 'rxjs/add/operator/toPromise';
import * as JSEncryptModule from 'jsencrypt';


@Component({
  selector: 'app-prescriptiontransaction',
  templateUrl: './PrescriptionTransaction.component.html',
  styleUrls: ['./PrescriptionTransaction.component.css'],
  providers: [PrescriptionTransactionService]
})
export class PrescriptionTransactionComponent implements OnInit {

  myForm: FormGroup;

  private allTransactions;
  private Transaction;
  private currentId;
  private errorMessage;

  patient = new FormControl('', Validators.required);
  physician = new FormControl('', Validators.required);
  medConceptID = new FormControl('', Validators.required);
  transactionId = new FormControl('', Validators.required);
  timestamp = new FormControl('', Validators.required);
  pubPatientKey = new FormControl('', Validators.required);

  testPubKey: string = '-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDqEF+XznkmB/UBaIUGuqMxLQVgHpceiMlFfoI+0ZBuCY8gSdlEFPYBRsZSK37uLKYQdz6PPpBCf/sgr1KuUbulKhnPiL9MH8dssM6M/wtMCWTputAjeqKAROqIPD4dwv7xS8D2Gzo7WRRFMjQriuQpV05ekDZ7XtasxFcQlzHfXQIDAQAB-----END PUBLIC KEY-----';
  

  constructor(private servicePrescriptionTransaction: PrescriptionTransactionService, fb: FormBuilder) {
    this.myForm = fb.group({
      patient: this.patient,
      physician: this.physician,
      medConceptID: this.medConceptID,
      transactionId: this.transactionId,
      timestamp: this.timestamp,
      pubPatientKey: this.pubPatientKey

    });
  };

  encrypt(patientKey: string, text: string): string{
    //encrypt all with patient pub key
    var encryptModule = new JSEncryptModule.JSEncrypt();
    console.log(patientKey);
    encryptModule.setPublicKey(patientKey);
    var encrypted = encryptModule.encrypt(text);

    return encrypted;

  }

  


  ngOnInit(): void {    
    this.loadAll();
    
  }

  loadAll(): Promise<any> {
    const tempList = [];
    return this.servicePrescriptionTransaction.getAll()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      result.forEach(transaction => {
        tempList.push(transaction);
      });
      this.allTransactions = tempList;
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

	/**
   * Event handler for changing the checked state of a checkbox (handles array enumeration values)
   * @param {String} name - the name of the transaction field to update
   * @param {any} value - the enumeration value for which to toggle the checked state
   */
  changeArrayValue(name: string, value: any): void {
    const index = this[name].value.indexOf(value);
    if (index === -1) {
      this[name].value.push(value);
    } else {
      this[name].value.splice(index, 1);
    }
  }

	/**
	 * Checkbox helper, determining whether an enumeration value should be selected or not (for array enumeration values
   * only). This is used for checkboxes in the transaction updateDialog.
   * @param {String} name - the name of the transaction field to check
   * @param {any} value - the enumeration value to check for
   * @return {Boolean} whether the specified transaction field contains the provided value
   */
  hasArrayValue(name: string, value: any): boolean {
    return this[name].value.indexOf(value) !== -1;
  }

  addTransaction(form: any): Promise<any> {
    var medConceptIDStringEncrypted: string = this.encrypt(this.pubPatientKey.value, this.medConceptID.value);
    
    this.Transaction = {
      $class: 'org.example.basic.PrescriptionTransaction',
      'patient': "resource:org.example.basic.Patient#" + this.patient.value,
      'physician': "resource:org.example.basic.Physician#" + this.physician.value,
      'medConceptID': medConceptIDStringEncrypted,
      'transactionId': this.transactionId.value,
      'timestamp': this.timestamp.value
    };

    this.myForm.setValue({
      'patient': null,
      'physician': null,
      'medConceptID': null,
      'transactionId': null,
      'timestamp': null,
      'pubPatientKey': null
    });

    return this.servicePrescriptionTransaction.addTransaction(this.Transaction)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.myForm.setValue({
        'patient': null,
        'physician': null,
        'medConceptID': null,
        'transactionId': null,
        'timestamp': null,
        'pubPatientKey': null
      });
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else {
        this.errorMessage = error;
      }
    });
  }

  updateTransaction(form: any): Promise<any> {
    this.Transaction = {
      $class: 'org.example.basic.PrescriptionTransaction',
      'patient': this.patient.value,
      'physician': this.physician.value,
      'medConceptID': this.medConceptID.value,
      'timestamp': this.timestamp.value
    };

    return this.servicePrescriptionTransaction.updateTransaction(form.get('transactionId').value, this.Transaction)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
      this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

  deleteTransaction(): Promise<any> {

    return this.servicePrescriptionTransaction.deleteTransaction(this.currentId)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

  setId(id: any): void {
    this.currentId = id;
  }

  getForm(id: any): Promise<any> {

    return this.servicePrescriptionTransaction.getTransaction(id)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      const formObject = {
        'patient': null,
        'physician': null,
        'medConceptID': null,
        'transactionId': null,
        'timestamp': null
      };

      if (result.patient) {
        formObject.patient = result.patient;
      } else {
        formObject.patient = null;
      }

      if (result.physician) {
        formObject.physician = result.physician;
      } else {
        formObject.physician = null;
      }

      if (result.medConceptID) {
        formObject.medConceptID = result.medConceptID;
      } else {
        formObject.medConceptID = null;
      }

      if (result.transactionId) {
        formObject.transactionId = result.transactionId;
      } else {
        formObject.transactionId = null;
      }

      if (result.timestamp) {
        formObject.timestamp = result.timestamp;
      } else {
        formObject.timestamp = null;
      }

      this.myForm.setValue(formObject);

    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
      this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

  resetForm(): void {
    this.myForm.setValue({
      'patient': null,
      'physician': null,
      'medConceptID': null,
      'transactionId': null,
      'timestamp': null,
      'pubPatientKey': null
    });
  }
}
