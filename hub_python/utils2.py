import micropython,os,sys
def d_e(filename):
	try:return os.stat(filename)[0]&16384!=0
	except OSError:return False
def rm(d):
	try:
		if os.stat(d)[0]&16384:
			for A in os.ilistdir(d):
				if A[0]not in('.','..'):rm('/'.join((d,A[0])))
			os.rmdir(d)
		else:os.remove(d)
	except:return
def upload_program(slot, size):
    if d_e("/flash/program"):
        try:
            os.mkdir("/flash/program/"+slot)
        except OSError:
            rm("/flash/program/"+slot)
            os.mkdir("/flash/program/"+slot)

    with open("/flash/program/"+slot+"/program.mpy", "w+", encoding="binary") as f:
        try:
           micropython.kbd_intr(-1)
           input = ''
           for x in range(size):
                input = sys.stdin.buffer.read(1)
                f.write(input)
        except Exception as e:
            print(e)
        micropython.kbd_intr(3)