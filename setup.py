from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in nsew_sales_visit_log/__init__.py
from nsew_sales_visit_log import __version__ as version

setup(
	name="nsew_sales_visit_log",
	version=version,
	description="Sales Visit Log Custom App",
	author="Nexgen ERP Technologies",
	author_email="info@nexgenerp.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
