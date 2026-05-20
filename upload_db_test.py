import ftplib
import socket

class FTP6(ftplib.FTP):
    address_family = socket.AF_INET6

def main():
    host = '2400:d321:2275:7309::1'
    user = 'test'
    passwd = 'iMy2ryLE34ea2rcF'
    
    print(f"Connecting to {host} over IPv6...")
    ftp = FTP6()
    ftp.connect(host, 21)
    ftp.login(user, passwd)
    print("Logged in successfully!")
    
    # Upload to staging (test)
    with open('db_test_advanced.php', 'rb') as f:
        ftp.storbinary("STOR /test/public/db_test_advanced.php", f)
    print("Uploaded to staging successfully!")
    
    # Upload to production
    with open('db_test_advanced.php', 'rb') as f:
        ftp.storbinary("STOR /public/db_test_advanced.php", f)
    print("Uploaded to production successfully!")
    
    ftp.quit()

if __name__ == '__main__':
    main()
