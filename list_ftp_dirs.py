import ftplib
import socket

class FTP6(ftplib.FTP):
    address_family = socket.AF_INET6

def list_recursive(ftp, path):
    print(f"\n--- Listing {path} ---")
    try:
        ftp.cwd(path)
        items = []
        ftp.retrlines('LIST', items.append)
        for item in items:
            print(item)
            parts = item.split()
            if len(parts) >= 9:
                name = parts[-1]
                if name in ('.', '..'):
                    continue
                # If directory
                if item.startswith('d'):
                    list_recursive(ftp, f"{path}/{name}")
    except Exception as e:
        print(f"Error listing {path}: {e}")

def main():
    host = '2400:d321:2275:7309::1'
    user = 'test'
    passwd = 'iMy2ryLE34ea2rcF'
    
    print(f"Connecting to {host} over IPv6...")
    ftp = FTP6()
    ftp.connect(host, 21)
    ftp.login(user, passwd)
    print("Logged in successfully!")
    
    print("--- /public Directory Listing ---")
    try:
        ftp.cwd('/public')
        ftp.retrlines('LIST')
    except Exception as e:
        print(f"Error listing public: {e}")
        
    print("\n--- /public/test Directory Listing ---")
    try:
        ftp.cwd('/public/test')
        ftp.retrlines('LIST')
    except Exception as e:
        print(f"Error listing public/test: {e}")
        
    ftp.quit()

if __name__ == '__main__':
    main()

