for f in css/*.less
do
  echo "Compiling $f"
  fname=$(echo $f | sed 's/css\/\(.*\)\.less/\1/')
  lessc $f css/$fname.css
  #echo lessc $f css/$fname.css
done

electron .
