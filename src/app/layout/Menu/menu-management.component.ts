import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuService } from '../../core/services/menu.service';
import { FoodTypeService } from '../../core/services/food-type.service';
import { ColDef, GridApi } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-menu-management', standalone: true,
  imports: [CommonModule,AgGridAngular],
  templateUrl: './menu-management.component.html',
  styleUrls: ['./menu-management.component.css']
})
export class MenuManagementComponent implements OnInit {

  @ViewChild(AgGridAngular) grid!: AgGridAngular;
  private gridApi!: GridApi;

  rowData: any[] = [];
  foodTypes: any[] = [];

  columnDefs: ColDef[] = [

    { headerName: 'ItemId', field: 'itemId', width: 100 },

    { headerName: 'Item Name', field: 'itemName', editable: true },

    {
      headerName: 'Food Type',
      field: 'itemTypeId',
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: () => ({
        values: this.foodTypes.map(ft => ft.foodTypeId)
      }),
      valueFormatter: params => {
        let ft = this.foodTypes.find(f => f.foodTypeId == params.value);
        return ft ? ft.foodTypeName : '';
      }
    },

    { headerName: 'Cost', field: 'itemCost', editable: true },
    { headerName: 'GST %', field: 'gstPercentage', editable: true },
    { headerName: 'CGST %', field: 'cgstPercentage', editable: true },
    { headerName: 'Created Date', field: 'createdDate' },

    {
      headerName: 'Image',
      field: 'imageUrl',
      cellRenderer: (params: ICellRendererParams) => {
        return params.value
          ? `<img src="${params.value}" style="width:60px;height:40px;object-fit:cover;" />`
          : '';
      }
    },

    // ⭐⭐⭐ ACTIONS COLUMN ⭐⭐⭐
    {
      headerName: 'Actions',
      cellRenderer: (params: ICellRendererParams) => {

        // NEW ROW → Show Save + Cancel
        if (params.data.isNew) {
          return `
            <button class="save-btn">Save</button>
            <button class="cancel-btn">Cancel</button>
          `;
        }

        // NORMAL ROW → Show Edit + Delete
        return `
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        `;
      },

      onCellClicked: (params) => {

        if (!params.event || !params.event.target) return;

        const target = params.event.target as HTMLElement;
        // SAVE NEW
        if (target.classList.contains('save-btn')) {
          this.saveNewItem(params.data);
        }

        // CANCEL NEW
        if (target.classList.contains('cancel-btn')) {
          if (params.rowIndex !== null) {
          this.cancelNew(params.rowIndex);
          }
        }

        // EDIT
        if (target.classList.contains('edit-btn')) {
          console.log("Edit clicked", params.data);
        }

        // DELETE
        if (target.classList.contains('delete-btn')) {
          this.deleteItem(params.data.itemId);
        }
      }
    }
  ];

  constructor(
    private menuService: MenuService,
    private foodTypeService: FoodTypeService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  // GRID READY
  onGridReady(params: any) {
    this.gridApi = params.api;
  }

  // LOAD DATA
  loadData() {
    this.foodTypeService.getFoodTypes().subscribe(food => {
      this.foodTypes = food;
    });

    this.menuService.getAll().subscribe(data => {
      this.rowData = data;
    });
  }

  // ⭐ ADD NEW ROW
  addNew() {
    const newRow = {
      itemId: 0,
      itemName: '',
      itemTypeId: null,
      itemCost: 0,
      gstPercentage: 0,
      cgstPercentage: 0,
      createdBy: 'Admin',
      imageUrl: '',
      isNew: true
    };

    this.rowData = [newRow, ...this.rowData];
  }

  // SAVE NEW ITEM
  saveNewItem(item: any) {
    item.isNew = false;
    console.log("Saving item:", item);

    this.menuService.create(item).subscribe({
      next: () => {
        alert("Item added successfully!");
        this.loadData();
      },
      error: err => console.error(err)
    });
  }

  // CANCEL NEW ROW
  cancelNew(rowIndex: number) {
    this.rowData.splice(rowIndex, 1);
    this.rowData = [...this.rowData];
  }

  // DELETE ITEM
  deleteItem(id: number) {
    if (!confirm("Are you sure you want to delete this item?")) return;

    this.menuService.delete(id).subscribe(() => {
      this.loadData();
    });
  }

  // SEARCH FILTER
  onSearch(event: any) {
    const q = event.target.value.toLowerCase();
    (this.gridApi as any).setQuickFilter(q);
  }

  // EXPORT EXCEL
  exportExcel() {
    this.gridApi.exportDataAsExcel({
      fileName: 'BillByte_Menu.xlsx'
    });
  }
}
