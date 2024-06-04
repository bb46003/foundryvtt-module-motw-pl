.PHONY: workon clear unpack_base_module unpack pack

include .env
export

LOCAL_PACK_DIRS := ./packs

workon:
	@fvtt package workon motw-fr --type Module

clear:
	@fvtt package clear

unpack_base_module:
	@make -s workon
	@echo "Unpack base module compendiums..."
	@for dir in $(shell ls ${PACK_DIRS}); do \
		fvtt package unpack --yaml --in $$PACK_DIRS --out _packs/extractions/$$dir $$dir >/dev/null; \
	done
	@make -s clear

unpack:
	@make -s workon
	@echo "Unpack compendiums..."
	@for dir in $(shell ls ${LOCAL_PACK_DIRS}); do \
	    fvtt package unpack --out _packs_sources/$$dir $$dir >/dev/null; \
	done
	@make -s clear

pack:
	@make -s workon
	@echo "Pack compendiums..."
	@for dir in $(shell ls ${LOCAL_PACK_DIRS}); do \
	    fvtt package pack --in _packs_sources/$$dir $$dir >/dev/null; \
	done
	@make -s clear
