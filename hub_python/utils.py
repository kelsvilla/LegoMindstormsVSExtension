import os,sys,micropython
def d_e(f):
	try:return os.stat(f)[0]&16384!=0
	except OSError:return False
def rm(d):
	try:
		if os.stat(d)[0]&16384:
			for A in os.ilistdir(d):
				if A[0]not in('.','..'):rm('/'.join((d,A[0])))
			os.rmdir(d)
		else:os.remove(d)
	except:return
def u_p(s):
	if d_e('/flash'):
		try: 
			if not d_e('/flash/lib'):os.mkdir('/flash/lib')
		except OSError as e:print(e);return
	with open('/flash/lib/mrutils.mpy','w+', encoding="binary")as A:
		i=''
		for B in range(s):
			micropython.kbd_intr(-1)
			try:i=sys.stdin.buffer.read(1);print(B);A.write(i)
			except Exception as e:print("Bad")
	micropython.kbd_intr(3)