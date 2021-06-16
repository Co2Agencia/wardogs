## Para usar repositorio:
1) Clonamos el repositorio(A) o creamos un repositorio remoto(B):
    - A| Clonamos:
        - ``` git clone https://github.com/Co2Agencia/wardogs.git ```
    
    - B| Creamos repositorio remote:
        - Iniciamos repositorio local: ``` git init ```
        - Conectamos con repostiorio en GITHUB: ``` git remote add origin https://github.com/Co2Agencia/wardogs.git ```
        - Traemos los cambios de GITHUB a local: ``` git pull origin master ```
        
1) Creamos variable de entorno en local
    - ``` python -m venv env ```

2) Descargamos requirements.txt
    - ``` pip install -r requirements.txt ```
