# Deploy notely.brandie.io.vn (Hostinger)

Muc tieu: sau moi lan cap nhat chi can chay `git pull && ./deploy.sh`.

## 1) Cau truc khuyen nghi tren server

```text
/home/u736596896/domains/notely.brandie.io.vn/
├── app_src/                                # repo git (private)
│   ├── backend/
│   ├── frontend/
│   └── deploy.sh
└── public_html -> app_src/backend/public   # symlink, neu host cho phep
```

Neu khong tao duoc symlink, dat Document Root cua domain tro thang vao:

```text
/home/u736596896/domains/notely.brandie.io.vn/app_src/backend/public
```

## 2) Cai dat lan dau

```bash
cd /home/u736596896/domains/notely.brandie.io.vn
git clone <your-repo-url> app_src
cd app_src
cp backend/.env.example backend/.env
```

Cap nhat `backend/.env` cho production:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://notely.brandie.io.vn`
- `FRONTEND_URL=https://notely.brandie.io.vn`
- Cau hinh DB, JWT, Google OAuth theo production

Sau do chay:

```bash
./deploy.sh
```

## 3) Moi lan update

```bash
cd /home/u736596896/domains/notely.brandie.io.vn/app_src
git pull
./deploy.sh
```

## 4) Luu y quan trong

- Khong can set `frontend/.env` tren production neu API va SPA cung 1 domain.
- Script se build frontend va copy vao `backend/public` (`index.html`, `assets`, icon files).
- Dam bao server co `php`, `composer`, `node`, `npm`.
- Neu quyen thu muc sai, fix:

```bash
cd /home/u736596896/domains/notely.brandie.io.vn/app_src/backend
chmod -R ug+rwx storage bootstrap/cache
```
