import { Component, OnInit } from '@angular/core';
import { PagesService } from '../../core/services/pages.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  pages: any[] = [];

  constructor(
    private pagesService: PagesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.pagesService.getPages().subscribe({
      next: (res) => {
        this.pages = res;
      },
      error: (err) => {
        console.error("Error loading pages:", err);
      }
    });
  }

  // ⭐ CLICK EVENT FOR SIDE MENU
  openPage(p: any) {
  if (p.pageName === 'Dashboard') {
    this.router.navigate(['/dashboard']);
  } 
  else if (p.pageName === 'Menu Management') {
    this.router.navigate(['/menu-management']);
  }
}
currentPage = 'Dashboard'
navigateTo(p: any) {
  this.currentPage = p.pageName;

  if (p.pageName === 'Dashboard') {
    this.router.navigate(['/dashboard']);
  } else if (p.pageName === 'Menu Management') {
    this.router.navigate(['/menu-management']);
  }
}

}
