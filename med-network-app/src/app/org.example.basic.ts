import {Asset} from './org.hyperledger.composer.system';
import {Participant} from './org.hyperledger.composer.system';
import {Transaction} from './org.hyperledger.composer.system';
import {Event} from './org.hyperledger.composer.system';
// export namespace org.example.basic{
   export class Patient extends Asset {
      patientId: string;
      firstName: string;
      lastName: string;
   }
   export class Physician extends Participant {
      physicianId: string;
      institutionId: string;
      firstName: string;
      lastName: string;
   }
   export class PrescriptionTransaction extends Transaction {
      patient: Patient;
      physician: Physician;
      medConceptID: string;
   }
// }
