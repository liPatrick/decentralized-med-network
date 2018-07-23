import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs/Observable';
import { HistorianRecord } from '../org.hyperledger.composer.system';
import 'rxjs';

@Injectable()
export class HistoryService {

  private NAMESPACE = 'queries/showCommodityAllHistorians?patient=resource%3A';

  constructor(private dataService: DataService<HistorianRecord>) { }

  public queryAsset(id: any): Observable<HistorianRecord[]> {
    return this.dataService.query(this.NAMESPACE, id);
  }


}


