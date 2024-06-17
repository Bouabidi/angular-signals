import {
  Component,
  computed,
  effect,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { CoursesService } from '../services/courses.service';
import { Course, sortCoursesBySeqNo } from '../models/course.model';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { CoursesCardListComponent } from '../courses-card-list/courses-card-list.component';
import { MatDialog } from '@angular/material/dialog';
import { MessagesService } from '../messages/messages.service';
import { catchError, firstValueFrom, from, throwError } from 'rxjs';
import {
  toObservable,
  toSignal,
  outputToObservable,
  outputFromObservable,
} from '@angular/core/rxjs-interop';

@Component({
  selector: 'home',
  standalone: true,
  imports: [MatTabGroup, MatTab, CoursesCardListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  courses = signal<Course[]>([]);
  coursesService = inject(CoursesService);

  beginnerCourses = computed(() => {
    // 1- define all signal dependencies
    const courses = this.courses();
    // 2- define the computation
    return courses.filter((course) => course.category === 'BEGINNER');
  });

  advancedCourses = computed(() => {
    const courses = this.courses();
    return courses.filter((course) => course.category === 'ADVANCED');
  });

  constructor() {
    effect(() => {
      console.log(`Beginner courses: `, this.beginnerCourses());
      console.log(`Advanced courses: `, this.advancedCourses());
    });
    this.loadCourses().then(() =>
      console.log(`all courses loaded:`, this.courses())
    );
  }

  async loadCourses() {
    try {
      const course = await this.coursesService.loadAllCourses();
      this.courses.set(course.sort(sortCoursesBySeqNo));
    } catch (error) {
      console.error(error);
    }
  }

  
  async onCourseUpdated(updatedCourse: Course) {
    const courses = this.courses();
    const newCourses = courses.map((course) =>
      course.id === updatedCourse.id ? updatedCourse : course
    );
    this.courses.set(newCourses);
  }
}
