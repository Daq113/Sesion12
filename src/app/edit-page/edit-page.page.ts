import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Post } from '../models/post.model';
import { LoadingController, ToastController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';  // Importa FormBuilder y FormGroup

@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.page.html',
  styleUrls: ['./edit-page.page.scss'],
})
export class EditPagePage implements OnInit {

  post: Post = { title: '', details: '' };
  id: string | null = null;
  editForm: FormGroup;  // Declaramos el FormGroup

  constructor(
    private actRoute: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private firestore: AngularFirestore,
    private router: Router,
    private toastCtrl: ToastController,
    private formBuilder: FormBuilder  // Inyectamos FormBuilder
  ) {
    // Inicializa el formulario
    this.editForm = this.formBuilder.group({
      title: ['', [Validators.required]],  // Validación requerida para el título
      details: ['', [Validators.required]]  // Validación requerida para los detalles
    });
  }

  ngOnInit() {
    this.id = this.actRoute.snapshot.paramMap.get("id");
    if (this.id) {
      this.getPostById(this.id);
    } else {
      this.showToast("No se encontró el ID de la publicación");
      this.router.navigate(['/home']);
    }
  }

  async getPostById(id: string) {
    const loader = await this.loadingCtrl.create({
      message: "Cargando publicación...",
    });
    await loader.present();

    this.firestore
      .doc(`post/${id}`)
      .valueChanges()
      .subscribe((data: any) => {
        if (data) {
          this.post = { ...data } as Post;
          // Actualiza el formulario con los datos obtenidos
          this.editForm.setValue({
            title: this.post.title,
            details: this.post.details
          });
        } else {
          this.showToast("No se encontró la publicación");
          this.router.navigate(['/home']);
        }
        loader.dismiss();
      }, (error) => {
        console.error("Error al obtener la publicación:", error);
        this.showToast("Error al cargar la publicación");
        loader.dismiss();
      });
  }

  async updatePost(post: Post) {
    if (!this.editForm.valid) {
      this.showToast("Por favor, complete todos los campos");
      return;
    }

    console.log("Datos enviados para actualización:", post);

    const loader = await this.loadingCtrl.create({
      message: "Actualizando publicación...",
    });
    await loader.present();

    this.firestore
      .doc(`post/${this.id}`)
      .update(post)
      .then(() => {
        this.showToast("Publicación actualizada correctamente");
        this.router.navigate(['/home']);
        loader.dismiss();
      })
      .catch((error) => {
        console.error("Error al actualizar la publicación:", error);
        this.showToast("Error al actualizar la publicación");
        loader.dismiss();
      });
  }

  showToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 3000,
    }).then((toast) => toast.present());
  }
}
