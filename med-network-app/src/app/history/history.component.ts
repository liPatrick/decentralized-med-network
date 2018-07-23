import { Component, OnInit } from '@angular/core';
import { HistoryService } from './history.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import * as JSEncryptModule from 'jsencrypt';
import { Transaction } from '../org.hyperledger.composer.system';


@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
  providers: [HistoryService]
})
export class HistoryComponent implements OnInit {

  private allAssets;
  private asset;
  private errorMessage;
  private patientId;
  private privPatientKey;


  testPrivKey: string = '-----BEGIN RSA PRIVATE KEY-----MIICWgIBAAKBgQDqEF+XznkmB/UBaIUGuqMxLQVgHpceiMlFfoI+0ZBuCY8gSdlEFPYBRsZSK37uLKYQdz6PPpBCf/sgr1KuUbulKhnPiL9MH8dssM6M/wtMCWTputAjeqKAROqIPD4dwv7xS8D2Gzo7WRRFMjQriuQpV05ekDZ7XtasxFcQlzHfXQIDAQABAn9L4wMbNNYSfoHw8vIuPFSsnOwhPcnBHJgk799KfqdVBcRhs4+9gw4/W7Lw8Sk2D0PIEuE1kBM1fEjvT+h+nAE57JBFe6sC2c0g/xIw5qZBSSwjQ/Amj+IiCG42GUutF7iMEPc8JpD+8u44TnCWcyVHVc8vLlte/1JYzPgLOaVBAkEA/vNZKW/oL5CCaePPYYjUGmubw9BReJ9xKm5OwgyeTJLTLLiktA8gPZ648q1gXohlGykDpTG6udnle5khv3Ni0QJBAOsHBBukOj3myPkxGjtNjbk4xOdX+6Vgh6age7M7ce18pn0QpFIw0pP5p0a+o2reJXNkhiDeCZNt1lQa8VQTXs0CQD0/OKw7tgu3K51EnQ1RUaMHNuRTpz7TDtyio0j6vwymORUFRov7FkO3Xbbu77fGDIP51mZZDAKZ1gdbQkA7+AECQQDRg+ymk42UF0N72ckPqsA3qSLnNSjRMa9b3F7J1alnU6K7hPVni7x9S6ZSS6o0n5p1NtzXOfkBY34YdfhCwg3VAkAVUT7HXzQ+EKOy66Vy+Acziff9zq3ayNQ8xB9rNg0Aa3CRSDXfuUnR4DMr/Eyqwq/w92c+WNDcdZR7S26B8Kg4-----END RSA PRIVATE KEY-----'

  decrypt(patientKey: string, encrypted: string): string{
    // Decrypt with the private key...
    var decryptModule = new JSEncryptModule.JSEncrypt();
    decryptModule.setPrivateKey(patientKey);
    var uncrypted = decryptModule.decrypt(encrypted);

    return uncrypted; 
  }

  constructor(public serviceHistory: HistoryService) { 
    
  }

  ngOnInit() {
  }
  
  getForm(id: any): Promise<any> {
    const tempList = [];
    const modifiedId = 'org.example.basic.Patient%23' + id;
    console.log(modifiedId);

    return this.serviceHistory.queryAsset(modifiedId)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      result.forEach(asset => {
        tempList.push(asset);
      });
      tempList.forEach( (transaction) => {
        console.log(this.privPatientKey);
  
        console.log(transaction.medConceptID);
        var decryptedString = this.decrypt(this.privPatientKey, transaction.medConceptID);
        transaction.medConceptID = decryptedString;
      });
      this.allAssets = tempList;
      console.log(this.allAssets);

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
}
