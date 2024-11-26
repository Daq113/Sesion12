import { Component } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  posts: any[] = []; // Inicializamos como un array vacío

  constructor(
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private firestore: AngularFirestore
  ) {}

  // Se ejecuta cada vez que la página es cargada o mostrada
  ionViewWillEnter() {
    this.getPost();
  }

  // Método para obtener publicaciones desde Firestore
  async getPost() {
    const loader = await this.loadingCtrl.create({
      message: 'Espere un momento por favor...',
    });
    await loader.present();

    try {
      this.firestore
        .collection('post')  // Asegúrate de que sea 'posts' y no 'post'
        .snapshotChanges()
        .subscribe((data: any[]) => {
          console.log('Datos recibidos desde Firestore:', data); // Depuración
          this.posts = data.map((e: any) => {
            const postData = e.payload.doc.data();
            const id = e.payload.doc.id;  // Obtén el id del documento
            console.log('Post procesado:', postData); // Depuración
            return {
              id: id,  // Incluye el id en cada objeto de post
              title: postData['title'] || 'Sin título',
              details: postData['details'] || 'Sin detalles',
            };
          });
          console.log('Posts asignados:', this.posts); // Depuración
        });

      await loader.dismiss();
    } catch (e: any) {
      console.error('Error al obtener publicaciones:', e); // Depuración
      this.showToast('Error al cargar publicaciones: ' + e.message);
      await loader.dismiss();
    }
  }


  // Método para eliminar publicaciones
  async deletePost(id: string) {
    const confirmed = confirm('¿Estás seguro de que quieres eliminar esta publicación?');
    if (!confirmed) return;

    const loader = await this.loadingCtrl.create({
      message: 'Eliminando publicación...',
    });
    await loader.present();

    try {
      await this.firestore.doc('post/' + id).delete();
      this.showToast('Publicación eliminada correctamente');
    } catch (e: any) {
      console.error('Error al eliminar publicación:', e); // Depuración
      this.showToast('Error al eliminar publicación: ' + e.message);
    } finally {
      await loader.dismiss();
    }
  }

  // Método para mostrar mensajes de usuario
  showToast(message: string) {
    this.toastCtrl
      .create({
        message,
        duration: 5000,
      })
      .then((toastData) => toastData.present());
  }
}
