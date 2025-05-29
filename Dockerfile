FROM docker.osgeo.org/geoserver:2.28.x
EXPOSE 8080
CMD ["catalina.sh", "run"]